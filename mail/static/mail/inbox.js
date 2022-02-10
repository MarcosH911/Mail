document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_mail(event) {
  event.preventDefault();
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox('sent');
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach((item) => {

        const email_div = document.createElement('div');
        
        build_mailbox_emails(item, email_div, mailbox);

        email_div.addEventListener("click", () => read_email(item["id"]));
        document.querySelector('#emails-view').appendChild(email_div);

        console.log(item);
      })
    })
}

function build_mailbox_emails(item, email_div, mailbox) {
  if (mailbox === "inbox" && item["archived"]) {
    return;
  }
  else if (mailbox === "archive" && !item["archived"]) {
    return;
  }

  const content = document.createElement("div")

  const recipients = document.createElement("div")
  if (mailbox === "sent") {
    recipients.innerHTML = item["recipients"].join(", ");
  } else {
    recipients.innerHTML = item["sender"];
  }
  content.appendChild(recipients);
  recipients.style.display = "inline-block";
  recipients.style.float = "left";

  const date = document.createElement("div");
  date.innerHTML = item["timestamp"];
  date.style.display = "inline-block";
  date.style.float = "right";
  date.style.marginLeft = "75px"

  if (item["read"]) {
    email_div.style.backgroundColor = "grey";
  } else {
    date.className = "text-muted";
  }
  content.appendChild(date);


  const subject = document.createElement("strong")
  subject.innerHTML = item["subject"]
  subject.style.display = "inline-block";
  subject.style.float = "right";
  content.appendChild(subject);
  
  content.innerHTML += " ";
  content.style.padding = "10px";
  email_div.appendChild(content);

  email_div.style.borderStyle = "solid";
  email_div.style.borderWidth = "3px";
  email_div.style.margin = "10px"; 
}
