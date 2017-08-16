test('index: #root', () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  require('./index');
  const root = document.querySelector('#root');
  expect(root.childNodes[0].textContent).toContain('react-empty');
});