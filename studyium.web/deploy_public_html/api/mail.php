<?php
// Custom Simple SMTP Class for Hostinger/PHP without Composer
require_once 'mail_config.php';

class SimpleSMTP {
    private $host;
    private $port;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = SMTP_HOST;
        $this->port = SMTP_PORT;
        $this->username = SMTP_USER;
        $this->password = SMTP_PASS;
    }

    private function log($msg) {
        file_put_contents('smtp_log.txt', date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
    }

    public function send($to, $subject, $body) {
        $this->log("Starting email send to: $to");
        
        $protocol = (defined('SMTP_SECURE') && SMTP_SECURE == 'tls') ? 'tcp' : 'ssl';
        $host_prefix = ($protocol == 'ssl') ? 'ssl://' : '';
        
        $this->log("Connecting to {$host_prefix}{$this->host}:{$this->port}");
        $this->conn = fsockopen("{$host_prefix}{$this->host}", $this->port, $errno, $errstr, 15);
        
        if (!$this->conn) {
            $this->log("Connection Failed: $errno $errstr");
            error_log("SMTP Connection Failed: $errno $errstr");
            return false;
        }
        $this->log("Connected.");

        $this->getResponse(); // Greeting

        $this->sendCommand("EHLO " . $_SERVER['SERVER_NAME']);
        
        if (defined('SMTP_SECURE') && SMTP_SECURE == 'tls') {
             $this->sendCommand("STARTTLS");
             stream_socket_enable_crypto($this->conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
             $this->sendCommand("EHLO " . $_SERVER['SERVER_NAME']);
        }

        $this->sendCommand("AUTH LOGIN");
        $this->sendCommand(base64_encode($this->username));
        $this->sendCommand(base64_encode($this->password));
        
        $this->sendCommand("MAIL FROM: <{$this->username}>");
        $this->sendCommand("RCPT TO: <$to>");
        $this->sendCommand("DATA");
        
        $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'Studyium';
        
        // Encode Subject for UTF-8
        $encoded_subject = "=?UTF-8?B?" . base64_encode($subject) . "?=";

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $fromName <{$this->username}>\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "Subject: $encoded_subject\r\n";
        $headers .= "Reply-To: {$this->username}\r\n";
        $headers .= "Date: " . date("r") . "\r\n";
        $headers .= "X-Mailer: PHP/Studyium\r\n";
        $headers .= "Message-ID: <" . uniqid() . "@" . $_SERVER['SERVER_NAME'] . ">\r\n";
        
        $this->sendCommand($headers . "\r\n" . $body . "\r\n.");
        $this->sendCommand("QUIT");
        
        fclose($this->conn);
        $this->log("Email sent successfully.");
        return true;
    }

    private function sendCommand($cmd) {
        // Mask password in logs
        if (strpos($cmd, base64_encode($this->password)) !== false) {
             $this->log("C: [PASSWORD HIDDEN]");
        } else {
             $this->log("C: $cmd");
        }
        
        fputs($this->conn, $cmd . "\r\n");
        return $this->getResponse();
    }

    private function getResponse() {
        $response = "";
        while ($str = fgets($this->conn, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == " ") break;
        }
        $this->log("S: $response");
        return $response;
    }
}

function send_verification_email($to, $name, $token, $type = 'register') {
    // Determine current domain dynamically or fallback
    $domain = $_SERVER['HTTP_HOST'] ?? 'studyium.com';
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $link = "$protocol://$domain/api/verify.php?email=" . urlencode($to) . "&token=" . $token;

    if ($type === 'login') {
        $subject = "Studyium Giriş Doğrulama";
        $title = "Tekrar Hoşgeldiniz, $name!";
        $intro = "Hesabınıza yeni bir giriş denemesi yapıldı veya doğrulama süreniz doldu.";
        $action_text = "Giriş yapmak için aşağıdaki kodu kullanınız:";
    } else {
        $subject = "Studyium Hesabınızı Doğrulayın";
        $title = "Hoşgeldiniz, $name!";
        $intro = "Studyium ailesine katıldığınız için teşekkür ederiz.";
        $action_text = "Hesabınızı doğrulamak için lütfen aşağıdaki kodu kayıt ekranına giriniz:";
    }
    
    $message = "
    <div style='font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: 0 auto;'>
        <h2 style='color: #4F46E5;'>$title</h2>
        <p>$intro</p>
        <p>$action_text</p>
        <div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;'>$token</div>
        <p style='font-size: 12px; color: #666;'>Bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
    </div>
    ";

    $smtp = new SimpleSMTP();
    return $smtp->send($to, $subject, $message);
}
?>
