const getScoreHeadline = (score: number) => {
  if (score > 80) {
    return {
      headline: "You deserve a round of API-lause!",
      sub: "But don't REST on your laurels",
    };
  }

  if (score > 60) {
    return {
      headline: "You're on the right track",
      sub: "Here's some tips to make your endpoints more API-ling",
    };
  }

  if (score > 40) {
    return {
      headline: "We API-reciate the effort",
      sub: "But you're not quite there yet",
    };
  }

  return {
    headline: "You have some work to do",
    sub: "REST assured, we can help!",
  };
};

export default getScoreHeadline;
