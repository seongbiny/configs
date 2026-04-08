# @edenyun/eslint-config

나만의 ESLint 설정 모음 (ESLint Flat Config 기반, TypeScript + React 지원)

## 설치

```bash
npm install -D @edenyun/eslint-config eslint typescript
```

## 사용법

### Next.js 프로젝트

```js
// eslint.config.js
import config from '@edenyun/eslint-config/next-js';
export default config;
```

### React 라이브러리 패키지

```js
// eslint.config.js
import config from '@edenyun/eslint-config/react-internal';
export default config;
```

### 기본 TypeScript 프로젝트

```js
// eslint.config.js
import config from '@edenyun/eslint-config';
export default config;
```

### 기존 설정에 확장하기

```js
// eslint.config.js
import { baseConfig } from '@edenyun/eslint-config';

export default [
  ...baseConfig,
  {
    rules: {
      // 프로젝트 전용 규칙 추가
    },
  },
];
```

## 포함된 설정

| 진입점 | 용도 | 추가 플러그인 |
|--------|------|--------------|
| `@edenyun/eslint-config` | 기본 TypeScript | - |
| `@edenyun/eslint-config/next-js` | Next.js App Router | eslint-plugin-react |
| `@edenyun/eslint-config/react-internal` | React 라이브러리 | eslint-plugin-react, eslint-plugin-react-hooks |

## 기본 규칙

- `no-var` — var 사용 금지
- `@typescript-eslint/no-unused-vars` — 미사용 변수 에러
- `@typescript-eslint/no-explicit-any` — any 타입 금지
- `simple-import-sort/imports` — import 자동 정렬
- `prettier/prettier` — Prettier 포맷 강제 (LF 줄 끝)
