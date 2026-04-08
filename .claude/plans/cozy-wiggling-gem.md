# 프로젝트 구조 심플화: apps 및 내부 패키지 제거

## Context

현재 프로젝트는 Turborepo 스캐폴딩으로 생성되어 `apps/`(Next.js 앱 2개)와 내부 전용 패키지들이 포함되어 있다.
목적이 `@edenyun/eslint-config`, `@edenyun/prettier-config` npm 배포 전용 프로젝트이므로
불필요한 디렉토리를 제거해 구조를 단순화한다.

## 최종 목표 구조

```
configs/
├── .changeset/
├── .github/workflows/publish.yml
├── packages/
│   ├── eslint-config/      ← @edenyun/eslint-config (npm 공개)
│   └── prettier-config/    ← @edenyun/prettier-config (npm 공개)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 제거 대상

| 경로 | 이유 |
|------|------|
| `apps/` | Next.js 테스트 앱 — 배포 프로젝트에 불필요 |
| `packages/ui/` | 앱 전용 내부 UI 라이브러리 — npm 배포 안 함 |
| `packages/typescript-config/` | 앱/UI 전용 내부 TS 설정 — npm 배포 안 함 |

## 수정 대상 파일

### 1. `pnpm-workspace.yaml`
```yaml
# 변경 전
packages:
  - "apps/*"
  - "packages/*"

# 변경 후
packages:
  - "packages/*"
```

### 2. `turbo.json`
```json
// 변경 전: dev(Next.js), build, lint, check-types
// 변경 후: lint만 남김 (eslint-config/prettier-config는 빌드 불필요)
{
  "tasks": {
    "lint": {}
  }
}
```

### 3. `package.json` (루트)
```json
// 변경 전 scripts
"build": "turbo run build",
"dev": "turbo run dev",         // ← 제거
"lint": "turbo run lint",
"format": "prettier --write ...",
"check-types": "turbo run check-types",  // ← 제거 (TS 컴파일 없음)
"changeset": "changeset",
"version-packages": "changeset version",
"release": "changeset publish"

// 변경 후 scripts
"lint": "turbo run lint",
"format": "prettier --write \"**/*.{js,ts,md}\"",
"changeset": "changeset",
"version-packages": "changeset version",
"release": "changeset publish"
```

## 작업 순서

1. `apps/` 디렉토리 삭제
2. `packages/ui/` 디렉토리 삭제
3. `packages/typescript-config/` 디렉토리 삭제
4. `pnpm-workspace.yaml` 수정
5. `turbo.json` 수정
6. `package.json` scripts 정리, `@repo/typescript-config` devDependency 제거(없으면 skip)
7. `pnpm install` — lock 파일 정리

## 검증

```bash
pnpm lint        # eslint-config, prettier-config 패키지 lint 통과 확인
pnpm install     # lock 파일 재생성 후 오류 없음 확인
```
