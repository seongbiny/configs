# 나만의 ESLint · Prettier npm 배포 프로젝트 플랜

---

## 현재 프로젝트 상태 분석

### 전체 구조 요약
```
configs/                         ← Turborepo 모노레포 루트
├── apps/
│   ├── web/                     ← Next.js 15 테스트 앱 (포트 3000)
│   └── docs/                    ← Next.js 15 테스트 앱 (포트 3001)
└── packages/
    ├── eslint-config/           ← @edenyun/eslint-config (v1.0.4) — npm 공개
    ├── prettier-config/         ← @edenyun/prettier-config (v1.0.2) — npm 공개
    ├── typescript-config/       ← @repo/typescript-config — 내부 전용
    └── ui/                      ← @repo/ui — 내부 전용
```

### 현재 코드가 가진 5가지 문제점

| # | 문제 | 파일 | 영향 |
|---|------|------|------|
| 1 | eslint-config에 서브패스 export 없음 | `packages/eslint-config/package.json` | next-js, react용 설정 분리 불가 |
| 2 | prettier-config에 `exports` 필드 없음 | `packages/prettier-config/package.json` | Node 모듈 해석 불안정 |
| 3 | 배포 파이프라인 전무 | 루트 | 수동 배포 → 실수 위험 |
| 4 | Changeset 없음 | 루트 | 버전 관리 체계 없음 |
| 5 | README가 `@turbo/eslint-config`로 표기 | `packages/eslint-config/README.md` | 외부 사용자 혼란 |

---

## 목표 아키텍처

### 완성 후 디렉토리 구조
```
configs/
├── .changeset/
│   └── config.json              ← Changeset 설정
├── .github/
│   └── workflows/
│       └── publish.yml          ← npm 자동 배포 워크플로
├── apps/
│   ├── web/                     ← Next.js 앱 (실제 패키지 테스트)
│   └── docs/                    ← Next.js 앱 (실제 패키지 테스트)
├── packages/
│   ├── eslint-config/
│   │   ├── src/
│   │   │   ├── base.js          ← 공통 기반 규칙
│   │   │   ├── next-js.js       ← Next.js App Router 전용
│   │   │   ├── react-internal.js← React 라이브러리 내부 전용
│   │   │   └── node.js          ← Node.js 서버 전용 (선택)
│   │   ├── index.js             ← base re-export
│   │   ├── next-js.js           ← re-export (루트 진입점)
│   │   ├── react-internal.js    ← re-export (루트 진입점)
│   │   └── package.json         ← exports 서브패스 3개
│   └── prettier-config/
│       ├── index.js
│       ├── index.d.ts
│       └── package.json         ← exports 필드 추가
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 단계별 구현 플랜

### STEP 1 — ESLint Config 패키지 재설계

#### 1-1. `packages/eslint-config/package.json` 수정
```json
{
  "name": "@edenyun/eslint-config",
  "version": "1.1.0",
  "type": "module",
  "private": false,
  "exports": {
    ".": "./index.js",
    "./next-js": "./next-js.js",
    "./react-internal": "./react-internal.js"
  },
  "files": [
    "index.js",
    "next-js.js",
    "react-internal.js",
    "*.d.ts"
  ],
  "publishConfig": { "access": "public" },
  "peerDependencies": {
    "eslint": "^9.0.0",
    "typescript": ">=5"
  },
  "dependencies": {
    "@eslint/js": "^9.29.0",
    "@typescript-eslint/eslint-plugin": "^8.35.0",
    "@typescript-eslint/parser": "^8.35.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.5.1",
    "eslint-plugin-react": "^7.37.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "globals": "^16.1.0",
    "typescript-eslint": "^8.35.0"
  }
}
```

**핵심**: `exports` 필드에 `.`, `./next-js`, `./react-internal` 세 진입점 추가

#### 1-2. `packages/eslint-config/index.js` — 기반 설정
```javascript
// 모든 config의 공통 기반
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export const baseConfig = [
  { ignores: ["dist", ".next", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-var": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "prettier/prettier": ["error", { endOfLine: "lf" }],
    },
  },
];

export default baseConfig;
```

#### 1-3. `packages/eslint-config/next-js.js` — Next.js 전용 (신규)
```javascript
import reactPlugin from "eslint-plugin-react";
import { baseConfig } from "./index.js";

export default [
  ...baseConfig,
  {
    plugins: { react: reactPlugin },
    rules: {
      "react/react-in-jsx-scope": "off",
      // Server Component에서 async 함수 허용
      "@typescript-eslint/require-await": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
```

#### 1-4. `packages/eslint-config/react-internal.js` — React 라이브러리 전용 (신규)
```javascript
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { baseConfig } from "./index.js";

export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
```

---

### STEP 2 — Prettier Config 패키지 정비

#### `packages/prettier-config/package.json` 수정
```json
{
  "name": "@edenyun/prettier-config",
  "version": "1.0.3",
  "type": "module",
  "private": false,
  "main": "index.js",
  "types": "index.d.ts",
  "exports": {
    ".": "./index.js"
  },
  "files": ["index.js", "index.d.ts"],
  "publishConfig": { "access": "public" },
  "peerDependencies": {
    "prettier": "^3.0.0"
  }
}
```

**변경사항**: `exports` 필드 추가, `dependencies` → `peerDependencies` 이동 (사용 프로젝트가 prettier를 직접 설치하도록)

---

### STEP 3 — 앱 eslint 설정 업데이트

**`apps/web/eslint.config.js`** 및 **`apps/docs/eslint.config.js`**:
```javascript
import config from "@edenyun/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default config;
```

**`packages/ui/eslint.config.mjs`**:
```javascript
import config from "@edenyun/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default config;
```

---

### STEP 4 — Changesets 설정 (버전 관리 자동화)

#### 설치
```bash
pnpm add -D @changesets/cli -w
pnpm changeset init
```

#### `.changeset/config.json`
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["web", "docs", "@repo/ui", "@repo/typescript-config"]
}
```

**포인트**: `ignore` 배열에 앱과 내부 패키지를 등록해서 public 패키지만 버전 관리

#### 루트 `package.json` scripts 추가
```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo build --filter=@edenyun/* && changeset publish"
  }
}
```

---

### STEP 5 — GitHub Actions 배포 파이프라인

#### `.github/workflows/publish.yml`
```yaml
name: Publish to npm

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  publish:
    name: Publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
          title: "chore: 패키지 버전 업데이트"
          commit: "chore: 패키지 버전 업데이트"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**동작 방식**:
1. `pnpm changeset` → 변경 내용 기록 파일 생성
2. main 브랜치에 push 되면 Actions가 "Version Packages" PR 자동 생성
3. PR 머지 시 npm 자동 배포

---

### STEP 6 — npm 토큰 설정

1. npmjs.com → Account Settings → Access Tokens → Generate New Token (Automation 타입)
2. GitHub 레포 → Settings → Secrets → `NPM_TOKEN` 이름으로 등록

---

### STEP 7 — README 작성

각 패키지에 올바른 README 작성:

#### `packages/eslint-config/README.md`
```markdown
# @edenyun/eslint-config

나만의 ESLint 설정 모음 (ESLint Flat Config 기반)

## 설치

\`\`\`bash
npm install -D @edenyun/eslint-config eslint typescript
\`\`\`

## 사용법

### Next.js 프로젝트
\`\`\`js
// eslint.config.js
import config from "@edenyun/eslint-config/next-js";
export default config;
\`\`\`

### React 라이브러리
\`\`\`js
// eslint.config.js
import config from "@edenyun/eslint-config/react-internal";
export default config;
\`\`\`

### 기본 TypeScript 프로젝트
\`\`\`js
// eslint.config.js
import config from "@edenyun/eslint-config";
export default config;
\`\`\`
```

---

## 전체 작업 순서 요약

```
1. packages/eslint-config/package.json   → exports 서브패스 3개 추가, 버전 1.1.0
2. packages/eslint-config/index.js       → baseConfig named export 추가
3. packages/eslint-config/next-js.js     → 신규 파일 생성
4. packages/eslint-config/react-internal.js → 신규 파일 생성
5. packages/prettier-config/package.json → exports 필드, peerDeps 변경, 버전 1.0.3
6. apps/web/eslint.config.js             → /next-js 서브패스로 변경
7. apps/docs/eslint.config.js            → /next-js 서브패스로 변경
8. packages/ui/eslint.config.mjs         → /react-internal 서브패스로 변경
9. 루트 package.json                     → changeset 스크립트 추가
10. pnpm add -D @changesets/cli -w
11. pnpm changeset init
12. .changeset/config.json               → ignore 설정
13. .github/workflows/publish.yml        → 자동 배포 워크플로
14. 각 패키지 README 업데이트
15. npm token 발급 → GitHub Secret 등록
```

---

## 검증 방법

### 로컬 검증
```bash
# 모든 워크스페이스 린트 통과 확인
pnpm lint

# 타입 체크
pnpm check-types

# 앱 개발 서버 실행 후 에디터에서 ESLint 경고 확인
pnpm dev
```

### 배포 전 수동 검증
```bash
# 패키지 내용 미리보기 (실제 배포 없이)
cd packages/eslint-config && npm pack --dry-run
cd packages/prettier-config && npm pack --dry-run
```

### 배포 후 검증
```bash
# 새 프로젝트에서 설치 테스트
mkdir test-project && cd test-project
npm init -y
npm install -D @edenyun/eslint-config @edenyun/prettier-config eslint prettier typescript
```

---

## 외부에서 사용하는 방법 (최종 결과)

```bash
# ESLint 설정
npm install -D @edenyun/eslint-config eslint typescript

# Prettier 설정
npm install -D @edenyun/prettier-config prettier
```

```js
// eslint.config.js (Next.js 프로젝트)
import config from "@edenyun/eslint-config/next-js";
export default config;
```

```json
// package.json
{
  "prettier": "@edenyun/prettier-config"
}
```

---

## 참고 파일 경로

| 파일 | 역할 |
|------|------|
| `packages/eslint-config/package.json` | exports 서브패스 정의 |
| `packages/eslint-config/index.js` | 기반 공통 설정 |
| `packages/eslint-config/next-js.js` | Next.js 전용 (신규) |
| `packages/eslint-config/react-internal.js` | React 라이브러리 전용 (신규) |
| `packages/prettier-config/package.json` | exports 필드 추가 |
| `.changeset/config.json` | 버전 관리 설정 |
| `.github/workflows/publish.yml` | 자동 배포 파이프라인 |
