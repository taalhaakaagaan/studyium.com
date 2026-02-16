<?php
require_once 'mail_config.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>SMTP Test</h1>";
echo "<pre>";

$to = SMTP_USER; // Send to self
$subject = "Debug Test " . date("H:i:s");
$body = "This is a test email.";

echo "Target Host: " . SMTP_HOST . ":" . SMTP_PORT . "\n";
echo "User: " . SMTP_USER . "\n";

class DebugSMTP {
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

    public function debug_send($to, $subject, $body) {
        $protocol = (defined('SMTP_SECURE') && SMTP_SECURE == 'tls') ? 'tcp' : 'ssl';
        $host_prefix = ($protocol == 'ssl') ? 'ssl://' : '';
        
        echo "Connecting to $host_prefix{$this->host}:{$this->port}...\n";
        
        $this->conn = fsockopen("{$host_prefix}{$this->host}", $this->port, $errno, $errstr, 15);
        
        if (!$this->conn) {
            echo "Failed to connect: $errno $errstr\n";
            return;
        }
        echo "Connected.\n";

        $this->cmd(""); // Read banner
        $this->cmd("EHLO " . $_SERVER['SERVER_NAME']);
        
        if (defined('SMTP_SECURE') && SMTP_SECURE == 'tls') {
             echo "Starting TLS...\n";
             $this->cmd("STARTTLS");
             if (stream_socket_enable_crypto($this->conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                 echo "TLS Success.\n";
                 $this->cmd("EHLO " . $_SERVER['SERVER_NAME']);
             } else {
                 echo "TLS Failed.\n";
                 return;
             }
        }

        $this->cmd("AUTH LOGIN");
        $this->cmd(base64_encode($this->username));
        $this->cmd(base64_encode($this->password));
        
        $this->cmd("MAIL FROM: <{$this->username}>");
        $this->cmd("RCPT TO: <$to>");
        $this->cmd("DATA");
        
        $headers = "Subject: $subject\r\n";
        $headers .= "From: {$this->username}\r\n";
        
        $this->cmd($headers . "\r\n" . $body . "\r\n.");
        $this->cmd("QUIT");
        
        fclose($this->conn);
    }

    private function cmd($cmd) {
        if ($cmd) {
            echo "C: $cmd\n";
            fputs($this->conn, $cmd . "\r\n");
        }
        
        while ($str = fgets($this->conn, 515)) {
            echo "S: $str";
            if (substr($str, 3, 1) == " ") break;
        }
    }
}

$debug = new DebugSMTP();
$debug->debug_send($to, $subject, $body);

echo "</pre>";
?>
