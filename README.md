# @edenyun 개발 도구 모음

🛠️ TypeScript/React 프로젝트를 위한 ESLint와 Prettier 공유 설정 패키지

## 패키지 목록

이 monorepo에는 다음 패키지들이 포함되어 있습니다:

- 📋 **[@edenyun/eslint-config](https://www.npmjs.com/package/@edenyun/eslint-config)** - TypeScript/React ESLint 설정
- 🎨 **[@edenyun/prettier-config](https://www.npmjs.com/package/@edenyun/prettier-config)** - 코드 포맷팅 Prettier 설정

## 빠른 시작

### 1. ESLint 설정

```bash
# 설치
npm install @edenyun/eslint-config --save-dev
npm install eslint typescript --save-dev

# eslint.config.js 생성
echo 'import config from "@edenyun/eslint-config"; export default config;' > eslint.config.js

# package.json 스크립트 추가
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.lint:fix="eslint . --fix"

# 실행
npm run lint
npm run lint:fix
```

### 2. Prettier 설정

```bash
# 설치 (Prettier 자동 포함)
npm install @edenyun/prettier-config --save-dev

# prettier.config.js 생성
echo 'import config from "@edenyun/prettier-config"; export default config;' > prettier.config.js

# package.json 스크립트 추가
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."

# 실행
npm run format
npm run format:check
```

### 3. 통합 사용 (ESLint + Prettier)

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run format:check && npm run lint",
    "fix": "npm run format && npm run lint:fix"
  }
}
```

```bash
npm run check  # 모든 검사
npm run fix    # 모든 자동 수정
