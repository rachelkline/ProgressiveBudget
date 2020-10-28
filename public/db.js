//create a new database request for a "budget" db
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    //create os called 'pending' with auto Inc -> true
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    //see if app is online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log(`ERROR: ${event.target.errorCode}`);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(['pending'], 'readwrite');
  
    // access your pending object store
    const store = transaction.objectStore('pending');
  
    // add record to your store with add method.
    store.add(record);
  }

function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(['pending'], 'readwrite');
    // access your pending object store
    const store = transaction.objectStore('pending');
    // get all records from store and set to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(() => {
            // if successful, open a transaction on your pending db
            const transaction = db.transaction(['pending'], 'readwrite');
  
            // access your pending object store
            const store = transaction.objectStore('pending');
  
            // clear all items in your store
            store.clear();
          });
      }
    };
  }
function deletePending() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.clear();
}

window.addEventListener("online", checkDatabase);