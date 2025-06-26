export default {
  trailingComma: "all", // 마지막 요소 뒤에 쉼표 추가
  tabWidth: 2, // 탭 너비 2
  semi: true, // 일부 코드에서 라인의 시작 부분에 세미 콜론 추가
  printWidth: 100, // 코드 줄 길이 100
  singleQuote: true, // 문자열은 홑 따옴표로 변환
  bracketSpacing: true, // 기본값. true인 경우 {foo:bar}는 { foo: bar }로 변환
  overrides: [
    {
      files: ["*.json", ".eslintrc"],
      options: { tabWidth: 2, trailingComma: "none" },
    },
  ], // JSON 파일은 들여쓰기 2, 마지막 요소 뒤에 쉼표 추가하지 않음
  useTabs: false, // 탭 대신 스페이스 사용
  endOfLine: "lf", // 줄 끝에 lf 추가
};
