import showdown from 'showdown';

const converter = new showdown.Converter();
export function mk2html(mk: string) {
  return converter.makeHtml(mk);
}