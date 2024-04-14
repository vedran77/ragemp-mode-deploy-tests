const wordsRegexp =
  /(server|peder|kurv|serv|srv|srw|IP|ajpi|debilčino|mrtvu|majku|sestru|šiptar|musliman|ustaš|katolik|židov|četni|balij|šipac|glupi|isus|božja|križ|šupak|sipac|ustasa|cetnik|zidov|discord|{|}|<|>)/gi;

export function prepareValue(value: string) {
  return value.replace(wordsRegexp, (res) =>
    res ? '*'.repeat(res.length) : ''
  );
}
