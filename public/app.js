async function loadBudget() {
  const res = await fetch('/budget', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch /budget');
  return res.json();
}

function buildCharts(items) {
  const labels = items.map(i => i.title);
  const values = items.map(i => i.value);
  const colors = items.map(i => i.color);

  const c1 = document.getElementById('chart1');
  if (c1) {
    new Chart(c1, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors }] },
    });
  }

  
  const c2 = document.getElementById('chart2');
  if (c2) {
    new Chart(c2, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Budget', data: values, backgroundColor: colors }],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const items = await loadBudget();
    console.log('items:', items); 
    buildCharts(items);
  } catch (e) {
    console.error(e);
  }
});
