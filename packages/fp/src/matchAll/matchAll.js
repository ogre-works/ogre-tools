import { isEmpty } from 'lodash/fp';

export default (targetString, regExpString) => {
  const regExp = new RegExp(regExpString, 'g');

  let matches = [];

  let execMatch;
  while ((execMatch = regExp.exec(targetString))) {
    const [match, group = null] = execMatch;

    matches.push({ match, group });
  }

  return !isEmpty(matches) ? matches : null;
};
