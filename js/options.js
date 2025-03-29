document.getElementById('save').addEventListener('click', () => {
  console.log("Save button clicked");
  const salary = parseFloat(document.getElementById('salary').value);
  console.log("Saving salary:", salary);
  chrome.storage.sync.set({ hourlySalary: salary }, () => {
    console.log("Salary saved to storage");
    alert('Salary saved!');
  });
});
