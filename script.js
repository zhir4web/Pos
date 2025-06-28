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

// Food items and their prices
const foods = [
  { name: 'فلاوفل', price: 500 },
  { name: 'مریشک', price: 1250 },
  { name: 'کوبە', price: 1000 },
  { name: 'جگێر', price: 1250 },
  { name: 'هەمبەرگر', price: 1250 },
  { name: 'شفتە', price: 1500 },
  { name: 'پەتاتە', price: 500 },
  { name: 'کنتاکی', price: 500 },
  { name: 'بۆرەک', price: 500 },
];

// Track counts for each food
let foodCounts = Array(foods.length).fill(0);

// Get all plus and minus buttons
const addBtns = document.querySelectorAll('.fa-plus');
const subBtns = document.querySelectorAll('.fa-minus');

// Update calculation display
function updateCalculation() {
  const totalCount = foodCounts.reduce((a, b) => a + b, 0);
  const totalPrice = foodCounts.reduce((sum, count, i) => sum + count * foods[i].price, 0);
  document.getElementById('count').textContent = totalCount;
  document.getElementById('calculate').textContent = totalPrice + ' دینار';
  // Show selected food types
  const selected = foodCounts.map((c, i) => c > 0 ? foods[i].name + ' (' + c + ')' : '').filter(Boolean).join(', ');
  document.getElementById('jor').textContent = selected;
}

addBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    foodCounts[idx]++;
    updateCalculation();
  });
});

subBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    if (foodCounts[idx] > 0) {
      foodCounts[idx]--;
      updateCalculation();
    }
  });
});

// Initialize display
updateCalculation();


const Sell = document.querySelector('button.bg-blue-500, button.bg-blue-600');

if (Sell) {
  Sell.addEventListener('click', () => {
    // Reset all food counts
    foodCounts = Array(foods.length).fill(0);
    updateCalculation();
    // Optionally, show a message or animation for successful sale
    // alert('فرۆشتن بەسەرکەوتوویی تەواو بوو!');
  });
}