<?php

// Check for empty fields
if(empty($_POST['name'])  	||
   empty($_POST['email']) 	||
   empty($_POST['message'])	||
   !filter_var($_POST['email'],FILTER_VALIDATE_EMAIL))
   {
	echo "No arguments Provided!";
	return false;
   }

   
$name = $_POST['name'];
$email_address = $_POST['email'];
$message = $_POST['message'];

// Create the email and send the message
$to = 'lowcode@cs.ucy.ac.cy'; // Add your email address inbetween the '' replacing yourname@yourdomain.com - This is where the form will send a message to.
$email_subject = "Website Contact Form:  $name";
$email_body = "You have received a new message from your website contact form.\n\n"."Here are the details:\n\nName: $name\n\nEmail: $email_address\n\nMessage:\n$message";
$headers = 'From: noreply@lowcode.cs.ucy.ac.cy' . "\r\n" .
    "Reply-To: $email_address" . "\r\n" .
    'X-Mailer: PHP/' . phpversion();
	
mail($to,$email_subject,$email_body,$headers);
echo 'Mail sent!';

return true;			
?>