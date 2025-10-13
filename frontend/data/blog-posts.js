const blogPosts = [
  {
    id: 1,
    title: "첫 번째 블로그 포스트",
    date: "2024-03-21",
    content:
      "# 첫 번째 블로그 포스트\n\n" +
      "안녕하세요! 이것은 마크다운으로 작성된 첫 번째 블로그 포스트입니다.\n\n" +
      "## 특징\n\n" +
      "- 마크다운 지원\n" +
      "- 코드 하이라이팅\n" +
      "- 테이블 지원\n\n" +
      "```javascript\n" +
      "const hello = 'world'\n" +
      "console.log(hello)\n" +
      "```\n\n" +
      "| 항목 1 | 항목 2 |\n" +
      "|--------|--------|\n" +
      "| 내용 1 | 내용 2 |\n\n" +
      "## 마크다운의 장점\n\n" +
      "마크다운은 다음과 같은 장점이 있습니다:\n\n" +
      "1. 간단한 문법\n" +
      "2. 빠른 작성 속도\n" +
      "3. 가독성이 좋음\n\n" +
      "### 코드 블록 예시\n\n" +
      "```python\n" +
      "def greet(name):\n" +
      "    return f'안녕하세요, {name}님!'\n" +
      "```\n\n" +
      "> 인용문도 쉽게 작성할 수 있습니다.\n\n" +
      "**굵은 글씨**와 *기울임체*도 지원됩니다.\n\n" +
      "#### 이미지 삽입 예시\n\n" +
      "![마크다운 로고](https://markdown-here.com/img/icon256.png)\n\n" +
      "---\n\n" +
      "더 많은 마크다운 문법은 [여기](https://www.markdownguide.org/)에서 확인하세요.",
  },
  {
    id: 2,
    title: "두 번째 블로그 포스트",
    date: "2024-03-22",
    content:
      "# 두 번째 블로그 포스트\n\n" +
      "마크다운으로 작성하는 두 번째 포스트입니다.\n\n" +
      "## 제목 2\n\n" +
      "본문 내용이 여기에 들어갑니다.",
  },
];

export default blogPosts;
