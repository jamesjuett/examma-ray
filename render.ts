import showdown from 'showdown';
import showdownHighlight from 'showdown-highlight'

const converter = new showdown.Converter({extensions: [showdownHighlight]});
export function mk2html(mk: string) {
  return converter.makeHtml(mk);
}