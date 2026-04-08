# @edenyun/prettier-config

나만의 Prettier 포맷 설정

## 설치

```bash
npm install -D @edenyun/prettier-config prettier
```

## 사용법

`package.json`에 추가:

```json
{
  "prettier": "@edenyun/prettier-config"
}
```

또는 `.prettierrc.js`에서 확장:

```js
// .prettierrc.js
import prettierConfig from '@edenyun/prettier-config';

export default {
  ...prettierConfig,
  // 프로젝트 전용 설정 추가
};
```

## 포함된 설정

| 옵션 | 값 |
|------|----|
| `trailingComma` | `all` |
| `tabWidth` | `2` |
| `semi` | `true` |
| `printWidth` | `100` |
| `singleQuote` | `true` |
| `bracketSpacing` | `true` |
| `useTabs` | `false` |
| `endOfLine` | `lf` |
