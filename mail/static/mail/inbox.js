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
  document.querySelector("#email-view").style.display = "none";
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
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach((item) => {

        const email_div = document.createElement('div');
        
        build_mailbox_emails(item, email_div, mailbox);

        email_div.addEventListener("click", () => view_email(item["id"]));
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

  const content = document.createElement("div");

  const recipients = document.createElement("div");
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
  date.style.marginLeft = "75px";

  if (item["read"]) {
    email_div.style.backgroundColor = "grey";
  } else {
    date.className = "text-muted";
  }
  content.appendChild(date);

  const subject = document.createElement("strong");
  subject.innerHTML = item["subject"];
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

function view_email(id) {

  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";
  document.querySelector("#email-view").innerHTML = "";
  
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(data => {
  build_email(data);
});

fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})
}

function build_email(data) {
  const sender = document.createElement("div");
  const recipients = document.createElement("div");
  const subject = document.createElement("div");
  const body = document.createElement("div");
  const timestamp = document.createElement("div");
  const reply_button = document.createElement("button");
  const archive_button = document.createElement("button");

  sender.innerHTML = `<strong>From: </strong> ${data["sender"]}`;
  recipients.innerHTML = `<strong>To: </strong> ${data["recipients"]}`;
  subject.innerHTML = `<strong>Subject: </strong> ${data["subject"]}`;
  timestamp.innerHTML = `<strong>Timestamp: </strong> ${data["timestamp"]}`;
  body.innerHTML = data["body"];

  archive_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>  ';
  if (data["archived"]) {
    archive_button.innerHTML += "Unarchive";
  } else {
    archive_button.innerHTML += "Archive";
  }
  archive_button.classList = "btn btn-outline-primary m-2";
  archive_button.addEventListener("click", () => {
    archive_email(data);
    load_mailbox("inbox");
  });

  reply_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
  reply_button.classList = "btn btn-outline-primary m-2";
  reply_button.addEventListener("click", () => compose_reply(data));
  
  document.querySelector("#email-view").appendChild(sender);
  document.querySelector("#email-view").appendChild(recipients);
  document.querySelector("#email-view").appendChild(subject);
  document.querySelector("#email-view").appendChild(timestamp);
  document.querySelector("#email-view").appendChild(archive_button);
  document.querySelector("#email-view").appendChild(reply_button);
  document.querySelector("#email-view").appendChild(document.createElement("hr"));
  document.querySelector("#email-view").appendChild(body);
}

function archive_email(data) {
  fetch(`/emails/${data["id"]}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !data["archived"]
    })
  });
}

function compose_reply(data) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector("#email-view").style.display = "none";
    document.querySelector('#compose-view').style.display = 'block';
  
    document.querySelector('#compose-recipients').value = data["sender"];
    document.querySelector('#compose-subject').value = ((data["subject"].match(/^(Re:)\s/)) ? data["subject"] : "Re: " + data["subject"]);
    document.querySelector('#compose-body').value = `On ${data["timestamp"]} ${data["sender"]} wrote:\n${data["body"]}\n-------------------------------------\n`;
}
