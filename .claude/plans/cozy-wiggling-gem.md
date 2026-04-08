# minor 버전 업 후 npm 배포

## Context

현재 npm에 배포된 버전: `@edenyun/eslint-config@1.1.0`, `@edenyun/prettier-config@1.0.3`
이번 작업에서 서브패스 추가, exports 정비 등 기능적 변경이 있었으므로 minor 업.

목표 버전:
- `@edenyun/eslint-config`: `1.1.0` → `1.2.0`
- `@edenyun/prettier-config`: `1.0.3` → `1.1.0`

## 작업 순서

### 1. changeset 파일 직접 생성
`pnpm changeset`은 대화형 CLI라 자동화 불가. changeset 파일을 수동으로 작성한다.

**파일**: `.changeset/minor-release.md`
```md
---
"@edenyun/eslint-config": minor
"@edenyun/prettier-config": minor
---

서브패스 config 추가(next-js, react-internal), prettier-config exports 필드 추가
```

### 2. 버전 자동 업데이트
```bash
pnpm version-packages
# → packages/eslint-config/package.json 1.1.0 → 1.2.0
# → packages/prettier-config/package.json 1.0.3 → 1.1.0
# → .changeset/minor-release.md 자동 삭제됨
```

### 3. npm 배포
```bash
pnpm release
```

### 4. 커밋 & push
```bash
git add -A
git commit -m "chore: @edenyun/eslint-config@1.2.0, @edenyun/prettier-config@1.1.0 릴리즈"
git push origin main
```

## 검증

- npmjs.com에서 `@edenyun/eslint-config` → 1.2.0 확인
- npmjs.com에서 `@edenyun/prettier-config` → 1.1.0 확인
