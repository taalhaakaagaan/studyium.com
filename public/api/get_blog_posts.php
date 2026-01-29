<?php
require_once 'db.php';

// Check if table exists, create if not
$conn->query("CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

// Check if empty, insert dummy data
$check = $conn->query("SELECT COUNT(*) as count FROM blog_posts");
if ($check->fetch_assoc()['count'] == 0) {
    $stmt = $conn->prepare("INSERT INTO blog_posts (title, excerpt, category, content) VALUES (?, ?, ?, ?)");
    
    $posts = [
        ["YKS 2025 Çalışma Stratejileri", "Sınava hazırlanırken dikkat edilmesi gerekenler...", "Rehberlik", "Detaylı içerik burada..."],
        ["Matematik Netleri Nasıl Artar?", "Geometri ve problemler için ipuçları.", "Ders Tavsiyeleri", "Detaylı içerik..."],
        ["Online Eğitimin Geleceği", "Birebir derslerin avantajları.", "Eğitim", "Detaylı içerik..."]
    ];
    
    foreach ($posts as $post) {
        $stmt->bind_param("ssss", $post[0], $post[1], $post[2], $post[3]);
        $stmt->execute();
    }
}

$slug = $_GET['slug'] ?? null;

if ($slug) {
    $stmt = $conn->prepare("SELECT * FROM blog_posts WHERE slug = ?");
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $result = $stmt->get_result();
    $post = $result->fetch_assoc();
    echo json_encode($post); // Return single object or null
} else {
    $result = $conn->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
    $posts = [];
    while ($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
    echo json_encode($posts);
}
?>
