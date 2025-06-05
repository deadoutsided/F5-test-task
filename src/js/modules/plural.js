export function greet() {
  console.log('Привет из модуля 1!');
}

export function plural(number, forms, lang = 'en-EN',) {
  const pr = new Intl.PluralRules(lang);
  const rule = pr.select(number);
  return forms[rule]
}
