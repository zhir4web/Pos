// bo bashi menu bchukka 
  document.getElementById('menu-btn').addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
  });

let count = 0;

const addBtn = document.getElementById('add');
const subBtn = document.getElementById('subtract');
const countDisplay = document.getElementById('count');



addBtn.addEventListener('click', () => {
  count++;
  countDisplay.textContent = count;
});

subBtn.addEventListener('click', () => {
  count--;
  countDisplay.textContent = count;
});
