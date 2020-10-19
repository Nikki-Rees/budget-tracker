let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
        console.log('Online, send data to MongoDB');
    } else {
        console.log('Offline, send data to IndexedDB')
    }

};

request.onerror = function (event) {
    console.log("Oops, error code: " + event.target.errorCode);
};

function saveRecord(record) {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    store.add(record);

}

function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const getAll = store.getAll();

    getAll.onsuccess = () => {

        console.log(getAll.result);
        if (getAll.result.length > 0) {
            console.log(getAll.result[1]);
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }

    };
    getAll.onerror = (error) => {
        console.log(error);
    }
};


window.addEventListener("offline", checkDatabase);
