const inputBox = document.querySelectorAll(".input-box");
const loadingDiv = document.querySelector(".info-bar");
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const WORD_VALIDATION_URL = "https://words.dev-apis.com/validate-word";
let column = 0;
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let done = false;
  const res = await fetch(WORD_URL);
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  let isLoading = true;

  setLoading(false);
  isLoading = false;
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter.toUpperCase();
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    inputBox[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      //do nothing
      return;
    }

    isLoading = true;
    setLoading(true);

    const res = await fetch(WORD_VALIDATION_URL, {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const currentGuessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (currentGuessParts[i] === wordParts[i]) {
        inputBox[ANSWER_LENGTH * currentRow + i].classList.add("correct");
        map[currentGuessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (currentGuessParts[i] === wordParts[i]) {
        // do nothing
      } else if (
        wordParts.includes(currentGuessParts[i]) &&
        map[currentGuessParts[i]] > 0
      ) {
        inputBox[ANSWER_LENGTH * currentRow + i].classList.add("close");
        map[currentGuessParts[i]]--;
      } else {
        inputBox[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
      }
    }
    currentRow++;
    if (currentGuess === word) {
      document.querySelector(".brand").classList.add("winner");
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      alert(`You lose the word is ${word}`);
      done = true;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    inputBox[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      inputBox[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");

      setTimeout(function() {
        inputBox[ANSWER_LENGTH * currentRow + i].classList.add("invalid");
      }, 10);
    }
  }
  document.addEventListener("keydown", function(event) {
    if (isLoading || done) {
      // do nothing
      return;
    }

    const key = event.key;
    if (key === "Enter") {
      // call some function
      commit();
    } else if (key === "Backspace") {
      backspace();
    } else if (isLetter(key)) {
      addLetter(key);
    } else {
      // do nothing
    }
  });
}
init();

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("show", isLoading);
}

function makeMap(array) {
  const obj = {};

  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}
