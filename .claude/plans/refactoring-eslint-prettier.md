# configs 모노레포 eslint/prettier 리팩토링 계획

## Context

현재 `@edenyun/eslint-config`, `@edenyun/prettier-config`가 npm에 올라가 있지만, 모노레포 내 앱들이 존재하지 않는 서브패스(`/next-js`, `/react-internal`)를 import하고, 패키지 이름도 `@repo/eslint-config`로 잘못 참조하는 버그가 있다. 이를 올바르게 구조화하여 npm publish 및 내부 workspace 사용이 모두 가능한 상태로 리팩토링한다.

---

## 핵심 문제

| 파일 | 현재 (버그) | 수정 후 |
|------|-----------|--------|
| `apps/web/eslint.config.js` | `@repo/eslint-config/next-js` (없음) | `@edenyun/eslint-config/next-js` |
| `apps/docs/eslint.config.js` | `@repo/eslint-config/next-js` (없음) | `@edenyun/eslint-config/next-js` |
| `packages/ui/eslint.config.mjs` | `@repo/eslint-config/react-internal` (없음) | `@edenyun/eslint-config/react-internal` |
| `eslint-config/package.json` | `exports` 필드 없음 (서브패스 불가) | `exports` 필드 추가 |


---

## 변경 파일 목록

### 1. `packages/eslint-config/package.json`

`exports` 필드와 `files` 추가, `eslint-plugin-react-hooks` 의존성 추가, 버전 → `1.1.0`

```json
{
  "version": "1.1.0",
  "exports": {
    ".": { "import": "./index.js", "types": "./index.d.ts" },
    "./next-js": { "import": "./next-js.js", "types": "./next-js.d.ts" },
    "./react-internal": { "import": "./react-internal.js", "types": "./react-internal.d.ts" }
  },
  "files": ["index.js","index.d.ts","next-js.js","next-js.d.ts","react-internal.js","react-internal.d.ts"]
}
```

의존성 추가: `"eslint-plugin-react-hooks": "^5.2.0"`

### 2. `packages/eslint-config/index.js` (base config 수정)

- `export const baseConfig = [...]` named export 추가 (다른 config 파일이 spread 가능)
- `globals.node` 추가 (현재 browser만 있어 Node.js 코드 오탐)
- ignores에 `.next`, `node_modules` 추가

### 3. `packages/eslint-config/next-js.js` (신규)

```javascript
import { baseConfig } from "./index.js";

export const nextJsConfig = [
  ...baseConfig,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/require-await": "off", // 서버 컴포넌트 async 허용
    },
  },
];

export default nextJsConfig;
```

### 4. `packages/eslint-config/react-internal.js` (신규)

```javascript
import pluginReactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "./index.js";

export const config = [
  ...baseConfig,
  {
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/prop-types": "off",       // TypeScript가 대체
      "react/display-name": "warn",
    },
  },
];

export default config;
```

### 5. 타입 정의 파일

- `packages/eslint-config/index.d.ts`: `baseConfig` named export 타입 추가
- `packages/eslint-config/next-js.d.ts` (신규): `nextJsConfig` 타입 정의
- `packages/eslint-config/react-internal.d.ts` (신규): `config` 타입 정의

### 6. `packages/prettier-config/package.json`

`exports` 필드 추가, 버전 → `1.0.3`

```json
{
  "version": "1.0.3",
  "exports": {
    ".": { "import": "./index.js", "types": "./index.d.ts" }
  }
}
```

### 7. `apps/web/eslint.config.js`

```javascript
import { nextJsConfig } from "@edenyun/eslint-config/next-js";
export default nextJsConfig;
```

### 8. `apps/docs/eslint.config.js`

동일하게 수정 (web과 동일)

### 9. `packages/ui/eslint.config.mjs`

```javascript
import { config } from "@edenyun/eslint-config/react-internal";
export default config;
```

### 10. 루트 `package.json`

prettier 설정 통합:
```json
{
  "prettier": "@edenyun/prettier-config",
  "devDependencies": {
    "@edenyun/prettier-config": "workspace:*"
  }
}
```

---

## 배포 순서

1. `packages/eslint-config` 수정 → `pnpm publish` (v1.1.0)
2. `packages/prettier-config` 수정 → `pnpm publish` (v1.0.3)
3. 모노레포 내 앱/패키지 import 경로 수정
4. `pnpm install` (lockfile 갱신)

## 검증

```bash
# 전체 lint 검증
pnpm turbo run lint

# 개별 패키지 확인
cd packages/ui && pnpm lint
cd apps/web && pnpm lint
cd apps/docs && pnpm lint

# prettier 포맷 확인
pnpm format
```
