<?php
require_once 'db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

function executeQuery($conn, $sql, $params = []) {
    if(empty($params)) {
        if ($conn->query($sql) !== TRUE) {
             throw new Exception("Error executing query: " . $conn->error . " | SQL: " . $sql);
        }
    } else {
        // ... (prepared statements not strictly needed for this fixed setup script but good practice)
    }
}

try {
    // 0. Drop Tables in Reverse Dependency Order
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");
    $conn->query("DROP TABLE IF EXISTS bookings");
    $conn->query("DROP TABLE IF EXISTS reviews");
    $conn->query("DROP TABLE IF EXISTS tutor_topics");
    $conn->query("DROP TABLE IF EXISTS topics");
    $conn->query("DROP TABLE IF EXISTS tutors");
    $conn->query("DROP TABLE IF EXISTS lessons");
    $conn->query("DROP TABLE IF EXISTS user_data");
    $conn->query("DROP TABLE IF EXISTS blog_posts");
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

    // 1. Users Table
    $sql = "CREATE TABLE user_data (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        gsm VARCHAR(20),
        password VARCHAR(255),
        role VARCHAR(10) DEFAULT 'user',
        google_id VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 2. Tutors Table
    $sql = "CREATE TABLE tutors (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT(6) UNSIGNED NOT NULL,
        bio TEXT,
        rating DECIMAL(2,1) DEFAULT 0.0,
        review_count INT DEFAULT 0,
        hourly_rate DECIMAL(10,2),
        fake_hourly_rate DECIMAL(10,2) DEFAULT NULL,
        subjects TEXT,
        course_details TEXT,
        account_name VARCHAR(100),
        iban VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 3. Lessons Table
    $sql = "CREATE TABLE lessons (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) -- 'TYT' or 'AYT'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 4. Topics Table
    $sql = "CREATE TABLE topics (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT(6) UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        fake_price DECIMAL(10,2) DEFAULT NULL,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 5. Tutor Topics Table (Many-to-Many)
    $sql = "CREATE TABLE tutor_topics (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tutor_id INT(6) UNSIGNED NOT NULL,
        topic_id INT(6) UNSIGNED NOT NULL,
        FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 6. Bookings Table
    $sql = "CREATE TABLE bookings (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tutor_id INT(6) UNSIGNED,
        student_id INT(6) UNSIGNED,
        lesson_id INT(6) UNSIGNED, -- Optional, or could reference topic_id
        booking_date DATETIME,
        status VARCHAR(20) DEFAULT 'pending',
        meeting_link VARCHAR(255),
        payment DECIMAL(10,2) DEFAULT NULL,
        note TEXT,
        FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES user_data(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 6.5 Site Visits Table
    $sql = "CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        visit_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_daily_visit (ip_address, visit_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 7. Reviews Table
    $sql = "CREATE TABLE reviews (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tutor_id INT(6) UNSIGNED,
        student_id INT(6) UNSIGNED,
        rating INT,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES user_data(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 8. Blog Posts Table
    $sql = "CREATE TABLE IF NOT EXISTS blog_posts (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100),
        excerpt TEXT,
        content LONGTEXT,
        image_url VARCHAR(255),
        author_id INT(6) UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 8.5 Messages Table
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT(6) UNSIGNED NOT NULL, -- Recipient
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    executeQuery($conn, $sql);

    // 9. Insert Admin
    $admin_email = 'studyium.17@gmail.com';
    $pass = 'HelloWorld!21'; 
    $conn->query("INSERT INTO user_data (name, surname, email, password, role, is_verified) 
                  VALUES ('Studyium', 'Admin', '$admin_email', '$pass', 'admin', 1)");

    // 10. Insert Seed Data
    // 10.1 Lessons (TYT & AYT)
    $lessons_tyt = ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü'];
    $lessons_ayt = ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Tarih-1', 'Tarih-2', 'Coğrafya-1', 'Coğrafya-2', 'Felsefe Grubu', 'Din Kültürü'];

    foreach ($lessons_tyt as $l) {
        $conn->query("INSERT INTO lessons (name, category) VALUES ('$l', 'TYT')");
    }
    foreach ($lessons_ayt as $l) {
        $conn->query("INSERT INTO lessons (name, category) VALUES ('$l', 'AYT')");
    }

    // 10.2 Topics (Comprehensive YKS List)
    $lesson_topics = [
        'Matematik' => [ // TYT & AYT Common Names
            'Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB-EKOK', 'Rasyonel Sayılar', 
            'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma',
            'Oran-Orantı', 'Problemler', 'Mantık', 'Kümeler', 'Fonksiyonlar', 'Polinomlar',
            'İkinci Dereceden Denklemler', 'Karmaşık Sayılar', 'Parabol', 'Eşitsizlikler',
            'Trigonometri', 'Logaritma', 'Diziler', 'Limit', 'Türev', 'İntegral', 'Permütasyon-Kombinasyon-Olasılık'
        ],
        'Geometri' => [
            'Doğruda ve Üçgende Açılar', 'Üçgende Uzunluk ve Benzerlik', 'Üçgende Alan', 'Açıortay-Kenarortay',
            'Özel Üçgenler', 'Çokgenler', 'Dörtgenler', 'Çember ve Daire', 'Analitik Geometri', 'Katı Cisimler', 'Çemberin Analitiği'
        ],
        'Fizik' => [
            'Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Hareket ve Kuvvet', 'Enerji', 'Isı ve Sıcaklık', 
            'Elektrostatik', 'Elektrik Akımı', 'Manyetizma', 'Basınç', 'Kaldırma Kuvveti', 'Dalgalar', 'Optik',
            'Vektörler', 'Bağıl Hareket', 'Newton\'un Hareket Yasaları', 'Bir Boyutta Sabit İvmeli Hareket',
            'Atışlar', 'İş, Güç ve Enerji II', 'İtme ve Momentum', 'Tork ve Denge', 'Kütle Merkezi', 
            'Basit Makineler', 'Elektrik Alan ve Potansiyel', 'Paralel Levhalar', 'Sığaçlar', 'Alternatif Akım',
            'Transformatörler', 'Düzgün Çembersel Hareket', 'Basit Harmonik Hareket', 'Açısal Momentum',
            'Kepler Kanunları', 'Büyük Patlama', 'Atom Fiziğine Giriş ve Radyoaktivite', 'Modern Fizik', 
            'Modern Fiziğin Teknolojideki Uygulamaları'
        ],
        'Kimya' => [
            'Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler', 'Maddenin Halleri', 
            'Doğa ve Kimya', 'Kimyanın Temel Kanunları', 'Mol Kavramı', 'Kimyasal Hesaplamalar', 'Karışımlar', 
            'Asitler, Bazlar ve Tuzlar', 'Kimya Her Yerde', 'Modern Atom Teorisi', 'Gazlar', 'Sıvı Çözeltiler', 
            'Kimyasal Tepkimelerde Enerji', 'Kimyasal Tepkimelerde Hız', 'Kimyasal Denge', 'Asit-Baz Dengesi', 
            'Çözünürlük Dengesi', 'Kimya ve Elektrik', 'Karbon Kimyasına Giriş', 'Organik Bileşikler', 'Enerji Kaynakları ve Bilimsel Gelişmeler'
        ],
        'Biyoloji' => [
            'Yaşam Bilimi Biyoloji', 'Hücre', 'Canlılar Dünyası', 'Hücre Bölünmeleri', 'Kalıtım', 'Ekosistem Ekolojisi',
            'Güncel Çevre Sorunları', 'Sinir Sistemi', 'Endokrin Sistem', 'Duyu Organları', 'Destek ve Hareket Sistemi',
            'Sindirim Sistemi', 'Dolaşım Sistemi', 'Solunum Sistemi', 'Üriner Sistem', 'Üreme Sistemi', 
            'Komünite ve Popülasyon Ekolojisi', 'Genden Proteine', 'Canlılarda Enerji Dönüşümleri', 'Bitki Biyolojisi', 'Canlılar ve Çevre'
        ],
        'Türkçe' => [
            'Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf', 'Ses Bilgisi', 'Yazım Kuralları', 'Noktalama İşaretleri',
            'Sözcükte Yapı', 'İsimler', 'Sıfatlar', 'Zamirler', 'Zarflar', 'Edat-Bağlaç-Ünlem', 'Fiiller', 'Ek Fiil',
            'Fiilimsi', 'Cümlenin Ögeleri', 'Fiil Çatısı', 'Cümle Türleri', 'Anlatım Bozuklukları'
        ],
        'Edebiyat' => [
            'Güzel Sanatlar ve Edebiyat', 'Metinlerin Sınıflandırılması', 'Şiir Bilgisi', 'Söz Sanatları', 'Edebi Akımlar',
            'İslamiyet Öncesi Türk Edebiyatı', 'İslami Dönem Türk Edebiyatı', 'Halk Edebiyatı', 'Divan Edebiyatı',
            'Tanzimat Dönemi', 'Servet-i Fünun ve Fecr-i Ati', 'Milli Edebiyat', 'Cumhuriyet Dönemi Şiir, Roman, Hikaye, Tiyatro'
        ],
        'Tarih' => [ // Covers both TYT/AYT general history
            'Tarih ve Zaman', 'İnsanlığın İlk Dönemleri', 'Orta Çağ\'da Dünya', 'İlk ve Orta Çağlarda Türk Dünyası',
            'İslam Medeniyetinin Doğuşu', 'Türklerin İslamiyeti Kabulü', 'Türkiye Tarihi', 'Beylikten Devlete',
            'Dünya Gücü Osmanlı', 'Yeni Çağ Avrupası', 'Yakın Çağ Avrupası', 'Değişim Çağında Avrupa ve Osmanlı',
            'Uluslararası İlişkilerde Denge', '20. YY Başlarında Osmanlı ve Dünya', 'Milli Mücadele', 'Atatürkçülük ve Türk İnkılabı',
            'İki Savaş Arasındaki Dönem', 'II. Dünya Savaşı', 'Soğuk Savaş Dönemi', 'Yumuşama Dönemi', 'Küreselleşen Dünya'
        ],
        'Tarih-1' => ['Tarih ve Zaman', 'Milli Mücadele', 'Atatürkçülük ve Türk İnkılabı'], // Example specific mapping if needed, simplified above covers most
        'Tarih-2' => ['Beylikten Devlete', 'Dünya Gücü Osmanlı', '20. YY Başlarında Osmanlı ve Dünya'],
        'Coğrafya' => [
            'Doğa ve İnsan', 'Dünya\'nın Şekli ve Hareketleri', 'Coğrafi Konum', 'Harita Bilgisi', 'Atmosfer ve İklim',
            'Sıcaklık', 'Basınç ve Rüzgarlar', 'Nem ve Yağış', 'İklim Tipleri', 'İç Kuvvetler', 'Dış Kuvvetler', 
            'Su Kaynakları', 'Topraklar', 'Bitkiler', 'Nüfus', 'Göç', 'Yerleşme', 'Ekonomik Faaliyetler', 
            'Bölgeler', 'Ulaşım', 'Doğal Afetler', 'Türkiye\'nin Yer Şekilleri', 'Türkiye\'nin İklimi', 
            'Türkiye\'nin Ekonomisi', 'Küresel Ortam'
        ],
        'Felsefe' => [
            'Felsefenin Alanı', 'Bilgi Felsefesi', 'Bilim Felsefesi', 'Varlık Felsefesi', 'Ahlak Felsefesi', 
            'Siyaset Felsefesi', 'Sanat Felsefesi', 'Din Felsefesi', 'MÖ 6. Yüzyıl - MS 2. Yüzyıl Felsefesi',
            'MS 2. Yüzyıl - MS 15. Yüzyıl Felsefesi', '15. Yüzyıl - 17. Yüzyıl Felsefesi', '18. Yüzyıl - 19. Yüzyıl Felsefesi', '20. Yüzyıl Felsefesi'
        ],
        'Felsefe Grubu' => [ // Psikoloji, Sosyoloji, Mantık
           'Psikoloji Bilimini Tanıyalım', 'Psikolojinin Temel Süreçleri', 'Öğrenme, Bellek, Düşünme', 'Ruh Sağlığının Temelleri',
           'Sosyolojiye Giriş', 'Birey ve Toplum', 'Toplumsal Yapı', 'Toplumsal Değişme ve Gelişme', 'Toplum ve Kültür', 'Toplumsal Kurumlar',
           'Mantığa Giriş', 'Klasik Mantık', 'Mantık ve Dil', 'Sembolik Mantık'
        ],
        'Din Kültürü' => [
            'İnanç', 'İbadet', 'Ahlak ve Değerler', 'Din, Kültür ve Medeniyet', 'Hz. Muhammed (S.A.V)', 
            'Vahiy ve Akıl', 'Dünya ve Ahiret', 'Kur\'an\'a Göre Hz. Muhammed', 'İslam Düşüncesinde Yorumlar'
        ]
    ];

    // Helper to get lesson id by name and category preference
    function getLessonId($conn, $name, $cat = null) {
        $sql = "SELECT id FROM lessons WHERE name='$name'";
        if ($cat) {
            $sql .= " AND category='$cat'";
        }
        $sql .= " LIMIT 1";
        
        $res = $conn->query($sql);
        if ($res && $res->num_rows > 0) return $res->fetch_assoc()['id'];
        
        // Fallback: search just by name if no specific cat or cat failed
        if ($cat) {
             $res = $conn->query("SELECT id FROM lessons WHERE name='$name' LIMIT 1");
             if ($res && $res->num_rows > 0) return $res->fetch_assoc()['id'];
        }
        return null;
    }

    // Insert Topics
    foreach ($lesson_topics as $lname => $topics) {
        // Handle categories logic
        // Try to insert these topics for ALL lessons related to this name (both TYT and AYT versions if exist)
        
        // Simple mapping to cover cases like "Tarih" maps to "Tarih" (TYT), "Tarih-1" (AYT), "Tarih-2" (AYT)
        // Ideally we fetch all lesson IDs that 'match' this topic group.
        
        $target_lesson_ids = [];
        
        // Custom matching logic for simplicity and coverage
        if ($lname == 'Matematik') {
            if($id = getLessonId($conn, 'Matematik', 'TYT')) $target_lesson_ids[] = $id;
            if($id = getLessonId($conn, 'Matematik', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Geometri') {
            if($id = getLessonId($conn, 'Geometri', 'TYT')) $target_lesson_ids[] = $id;
            if($id = getLessonId($conn, 'Geometri', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Fizik') {
            if($id = getLessonId($conn, 'Fizik', 'TYT')) $target_lesson_ids[] = $id;
            if($id = getLessonId($conn, 'Fizik', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Kimya') {
            if($id = getLessonId($conn, 'Kimya', 'TYT')) $target_lesson_ids[] = $id;
            if($id = getLessonId($conn, 'Kimya', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Biyoloji') {
            if($id = getLessonId($conn, 'Biyoloji', 'TYT')) $target_lesson_ids[] = $id;
            if($id = getLessonId($conn, 'Biyoloji', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Tarih') {
            if($id = getLessonId($conn, 'Tarih', 'TYT')) $target_lesson_ids[] = $id;
            // AYT History is typically Tarih-1/2, handled by dedicated keys or generic mapping below? 
            // Let's rely on specific keys below for AYT history, or map specific here if keys don't match EXACT lesson name
        } elseif ($lname == 'Tarih-1') {
             if($id = getLessonId($conn, 'Tarih-1', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Tarih-2') {
             if($id = getLessonId($conn, 'Tarih-2', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Coğrafya') {
            if($id = getLessonId($conn, 'Coğrafya', 'TYT')) $target_lesson_ids[] = $id;
             // Coğrafya-1/2, see specific keys logic
        } elseif ($lname == 'Coğrafya-1') {
            if($id = getLessonId($conn, 'Coğrafya-1', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Coğrafya-2') {
            if($id = getLessonId($conn, 'Coğrafya-2', 'AYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Felsefe') {
             if($id = getLessonId($conn, 'Felsefe', 'TYT')) $target_lesson_ids[] = $id;
        } elseif ($lname == 'Felsefe Grubu') {
             if($id = getLessonId($conn, 'Felsefe Grubu', 'AYT')) $target_lesson_ids[] = $id;
        }  else {
            // Generic fallback, e.g. 'Türkçe', 'Edebiyat', 'Din Kültürü'
             if($id = getLessonId($conn, $lname)) $target_lesson_ids[] = $id;
        }
        
        // If we found NO target logic above, try direct name match
        if (empty($target_lesson_ids)) {
             if($id = getLessonId($conn, $lname)) $target_lesson_ids[] = $id;
        }
        
        foreach ($target_lesson_ids as $lid) {
            foreach ($topics as $t) {
                // Check dupes not needed for fresh setup
                $safe_t = $conn->real_escape_string($t);
                $conn->query("INSERT INTO topics (lesson_id, name) VALUES ($lid, '$safe_t')");
            }
        }
    }

    // 10.3 Tutors
    $tutors_data = [
        ['Ali', 'Yılmaz', 'Matematik Dehası', 4.9, 1200, 1500, 'Matematik'],
        ['Ayşe', 'Kaya', 'Fizik Uzmanı', 4.8, 1000, 1200, 'Fizik'],
        ['Veli', 'Demir', 'Kimya ve Biyoloji', 4.7, 900, 1100, 'Kimya, Biyoloji'],
        ['Fatma', 'Çelik', 'Matematik ve Geometri', 5.0, 1500, null, 'Matematik'],
        ['Merve', 'Öztürk', 'Türkçe Edebiyat', 4.6, 800, 900, 'Türkçe, Edebiyat'],
        ['Hasan', 'Yıldırım', 'Tarih ve Coğrafya', 4.5, 750, 850, 'Tarih, Coğrafya']
    ];

    $tutor_ids = [];

    foreach ($tutors_data as $i => $t) {
        $email = "tutor$i@studyium.com";
        $conn->query("INSERT INTO user_data (name, surname, email, password, role, is_verified) 
                      VALUES ('$t[0]', '$t[1]', '$email', 'pass123', 'tutor', 1)");
        $uid = $conn->insert_id;
        $fake = $t[5] ? $t[5] : 'NULL';
        $bio = "Merhaba, ben " . $t[0] . ". " . $t[6] . " alanında 10 yıllık tecrübem var. YKS sürecinde size en iyi şekilde destek olabilirim. Kişiye özel programlarla başarıya ulaşmanızı sağlıyorum.";
        
        $conn->query("INSERT INTO tutors (user_id, bio, rating, review_count, hourly_rate, fake_hourly_rate, subjects) 
                      VALUES ($uid, '$bio', $t[3], 15, $t[4], $fake, '$t[6]')");
        $tid = $conn->insert_id;
        $tutor_ids[] = $tid;

        // Assign some random topics
        $subjects = explode(',', $t[6]);
        foreach ($subjects as $subj) {
            $subj = trim($subj);
            $lid = getLessonId($conn, $subj);
            if ($lid) {
                $res = $conn->query("SELECT id FROM topics WHERE lesson_id=$lid");
                while ($row = $res->fetch_assoc()) {
                    if (rand(0, 100) > 60) { // 40% chance to have this topic
                        $topid = $row['id'];
                        $conn->query("INSERT INTO tutor_topics (tutor_id, topic_id) VALUES ($tid, $topid)");
                    }
                }
            }
        }
    }
    
    // 10.4 Seed Reviews
    $reviews = [
        "Harika bir öğretmen, kesinlikle tavsiye ederim.",
        "Konuları çok akıcı anlatıyor.",
        "Derslerimiz çok verimli geçiyor.",
        "Eksiklerimi sayesinde tamamladım, teşekkürler.",
        "Online derste bu kadar verim alacağımı düşünmemiştim.",
        "Çok ilgili ve bilgili bir eğitmen."
    ];
    
    // Create a dummy student for reviews
    $conn->query("INSERT INTO user_data (name, surname, email, password, role, is_verified) VALUES ('Öğrenci', 'Deneme', 'student@test.com', '123456', 'user', 1)");
    $sid = $conn->insert_id;
    
    foreach ($tutor_ids as $tid) {
        // Add 2-3 reviews per tutor
        $count = rand(2, 4);
        for ($i=0; $i<$count; $i++) {
            $rating = rand(4, 5);
            $comment = $reviews[array_rand($reviews)];
            $conn->query("INSERT INTO reviews (tutor_id, student_id, rating, comment) VALUES ($tid, $sid, $rating, '$comment')");
        }
        
        // Update tutor review count and average
        $conn->query("UPDATE tutors SET review_count = (SELECT COUNT(*) FROM reviews WHERE tutor_id=$tid), rating = (SELECT AVG(rating) FROM reviews WHERE tutor_id=$tid) WHERE id=$tid");
    }

    echo json_encode(["message" => "Database Setup Completely Reset and Re-initialized Successfully!"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Setup Error: " . $e->getMessage()]);
}

$conn->close();
?>
