use lettre::message::header;
use lettre::message::Mailbox;
use lettre::message::SinglePart;
use lettre::transport::smtp::authentication::Credentials;
use lettre::AsyncSmtpTransport;
use lettre::AsyncStd1Executor;
use lettre::AsyncTransport;
use lettre::Message;

#[derive(Clone)]
pub struct SMTPCredentials {
    pub password: String,
}

pub async fn send_email_confirmation_code(
    credentials: SMTPCredentials,
    user_name: String,
    code: &str,
    receiver_email: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let email = Message::builder()
        .from(Mailbox::new(
            Some("nfreelanci.tn".to_string()),
            "no-reply@nfreelanci.tn".parse()?,
        ))
        .to(receiver_email.parse()?)
        .subject("Verify your email")
        .singlepart(
            SinglePart::builder()
                .header(header::ContentType::TEXT_PLAIN)
                .body(format!(
                    include_str!("templates/confirmation_email.txt"),
                    user_name = user_name,
                    code = code
                )),
        )?;

    let creds = Credentials::new("no-reply@nfreelanci.tn".to_string(), credentials.password);

    let mailer = AsyncSmtpTransport::<AsyncStd1Executor>::relay("ssl0.ovh.net")?
        .credentials(creds)
        .build();

    mailer.send(email).await?;
    Ok(())
}
