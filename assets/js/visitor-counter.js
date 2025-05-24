// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByMeC-9rQlygbQ6JHjbsSwnFzAwQe_Kvw",
  authDomain: "enggal-jaya.firebaseapp.com",
  databaseURL: "https://enggal-jaya-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "enggal-jaya",
  storageBucket: "enggal-jaya.firebasestorage.app",
  messagingSenderId: "280949878033",
  appId: "1:280949878033:web:7f5d8ec30540a78aac70b0"
};

// Konfigurasi Counter
const COUNTER_CONFIG = {
  // Waktu minimum (dalam milidetik) antara dua kunjungan untuk dianggap sebagai kunjungan baru
  // Default: 30 menit = 1800000 ms
  VISIT_TIMEOUT: 1800000,
  
  // Nama key untuk sessionStorage
  SESSION_KEY: 'enggalJayaVisited',
  
  // Nama key untuk localStorage
  LOCAL_STORAGE_KEY: 'enggalJayaLastVisit',
  
  // Debug mode (set ke true untuk melihat log di console)
  DEBUG: true
};

// Tunggu sampai dokumen dimuat
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Inisialisasi Firebase
    if (typeof firebase !== 'undefined') {
      // Inisialisasi Firebase hanya jika belum diinisialisasi
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      // Referensi ke database
      const visitorCountRef = firebase.database().ref('visitorCount');

      // Fungsi untuk menambah jumlah pengunjung (hanya untuk pengunjung baru)
      function incrementVisitorCount() {
        try {
          // Dapatkan nama file halaman saat ini
          const path = window.location.pathname;
          const currentPage = path.split('/').pop() || 'index.html';
          
          // Hanya proses jika halaman saat ini adalah index.html
          // atau root path (/) atau halaman utama dengan nama domain saja
          if (currentPage === 'index.html' || currentPage === '' || path === '/') {
            // Cek apakah ini adalah kunjungan baru menggunakan sessionStorage dan localStorage
            const isNewVisit = checkIfNewVisit();
            
            if (isNewVisit) {
              logMessage('Kunjungan baru terdeteksi, menambah counter pengunjung');
              visitorCountRef.transaction((currentCount) => {
                return (currentCount || 0) + 1;
              }).catch(error => {
                console.error('Error saat menambah counter:', error);
              });
            } else {
              logMessage('Bukan kunjungan baru, tidak menambah counter');
            }
          } else {
            logMessage('Bukan halaman home, tidak menambah counter');
          }
        } catch (error) {
          console.error('Error saat mendeteksi halaman:', error);
        }
      }

      // Fungsi untuk memeriksa apakah ini adalah kunjungan baru
      function checkIfNewVisit() {
        // 1. Cek sessionStorage - jika ada, berarti user sudah mengakses website ini dalam sesi ini
        if (sessionStorage.getItem(COUNTER_CONFIG.SESSION_KEY)) {
          return false;
        }

        // 2. Set flag di sessionStorage untuk mencegah penambahan counter saat navigasi dalam sesi yang sama
        sessionStorage.setItem(COUNTER_CONFIG.SESSION_KEY, 'true');

        // 3. Cek localStorage untuk timestamp kunjungan terakhir
        const lastVisitTimestamp = localStorage.getItem(COUNTER_CONFIG.LOCAL_STORAGE_KEY);
        const currentTime = new Date().getTime();
        
        // 4. Jika tidak ada timestamp atau sudah lebih dari waktu timeout sejak kunjungan terakhir
        if (!lastVisitTimestamp || (currentTime - parseInt(lastVisitTimestamp)) > COUNTER_CONFIG.VISIT_TIMEOUT) {
          // Update timestamp kunjungan terakhir
          localStorage.setItem(COUNTER_CONFIG.LOCAL_STORAGE_KEY, currentTime.toString());
          return true;
        }
        
        return false;
      }

      // Fungsi untuk menampilkan jumlah pengunjung (di semua halaman)
      function displayVisitorCount() {
        visitorCountRef.on('value', (snapshot) => {
          try {
            const count = snapshot.val() || 0;
            const counterElement = document.getElementById('visitor-count');
            if (counterElement) {
              counterElement.textContent = count;
            }
          } catch (error) {
            console.error('Error saat menampilkan counter:', error);
          }
        }, (error) => {
          console.error('Error saat membaca data counter:', error);
        });
      }

      // Fungsi untuk reset data kunjungan lokal (untuk pengujian)
      function resetLocalVisitData() {
        try {
          sessionStorage.removeItem(COUNTER_CONFIG.SESSION_KEY);
          localStorage.removeItem(COUNTER_CONFIG.LOCAL_STORAGE_KEY);
          logMessage('Data kunjungan lokal telah direset');
          return true;
        } catch (error) {
          console.error('Error saat reset data kunjungan:', error);
          return false;
        }
      }

      // Fungsi untuk reset counter di Firebase (hanya untuk admin)
      function resetCounter() {
        try {
          if (confirm('Apakah Anda yakin ingin mereset counter pengunjung ke 0?')) {
            visitorCountRef.set(0).then(() => {
              alert('Counter pengunjung berhasil direset ke 0');
            }).catch(error => {
              console.error('Error saat reset counter:', error);
              alert('Gagal mereset counter: ' + error.message);
            });
          }
        } catch (error) {
          console.error('Error saat reset counter:', error);
        }
      }

      // Fungsi helper untuk logging
      function logMessage(message) {
        if (COUNTER_CONFIG.DEBUG) {
          console.log('[Visitor Counter]', message);
        }
      }

      // Panggil fungsi-fungsi
      incrementVisitorCount(); // Hanya menambah counter untuk pengunjung baru
      displayVisitorCount();   // Menampilkan counter di semua halaman

      // Ekspos fungsi reset untuk pengujian (bisa diakses dari console)
      window.resetVisitorCounterData = resetLocalVisitData;
      window.resetVisitorCounter = resetCounter;
    } else {
      console.error('Firebase SDK belum dimuat dengan benar');
    }
  } catch (error) {
    console.error('Error saat inisialisasi visitor counter:', error);
  }
}); 