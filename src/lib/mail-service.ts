import { resend } from './mail';

export type SendOwnerEmailOptions = {
  name: string;
  email: string;
  destination: string;
  startDate: string;
  endDate: string;
  guestList: string[];
};

export type SendGuestInviteEmailOptions = {
  name: string;
  email: string;
  destination: string;
  startDate: string;
  endDate: string;
  confirmationLink: string;
  ownerName: string;
};

const bannerUrl = 'https://i.imgur.com/ja7F5dq.png';

export async function sendOwnerEmail(options: SendOwnerEmailOptions) {
  const { name, email, destination, startDate, endDate, guestList } = options;

  const html = `
    <div style="background-color: #f8fafc; padding: 32px; font-family: sans-serif; border-radius: 12px;">
      <img src="${bannerUrl}" width="100%" alt="Trip banner" style="border-radius: 12px; margin-bottom: 24px;" />

      <h2 style="color: #0f172a;">Hi ${name}, your trip was created successfully!</h2>

      <p style="font-size: 16px; color: #334155; line-height: 1.5;">
        You've created a trip to <strong>${destination}</strong> from <strong>${startDate}</strong> to <strong>${endDate}</strong>.
      </p>

      <p style="font-size: 16px; color: #334155; line-height: 1.5;">
        The following guests have been invited:
      </p>

      <ul style="color: #475569; font-size: 15px; padding-left: 20px;">
        ${guestList.map(email => `<li color: #71a021;>${email}</li>`).join('')}
      </ul>

      <p style="font-size: 14px; color: #334155; margin-top: 24px;">
        Each guest will receive an email to confirm their participation.
      </p>

      <p style="font-size: 13px; color: #334155;">
        Best regards, <br />
        Plann.er Team
      </p>
    </div>
  `.trim();

  try {
    await resend.emails.send({
      from: 'Plann.er <onboarding@resend.dev>',
      to: [email],
      subject: `Trip to ${destination} created!`,
      html,
    });
  } catch (error) {
    console.error(`Failed to send trip confirmation email to ${email}`, error);
  }
}

export async function sendGuestInviteEmail(options: SendGuestInviteEmailOptions) {
  const { name, email, destination, startDate, endDate, confirmationLink, ownerName } = options;

  const html = `
    <div style="background-color: #f8fafc; padding: 32px; font-family: sans-serif; border-radius: 12px;">
      <img src="${bannerUrl}" width="100%" alt="Trip banner" style="border-radius: 12px; margin-bottom: 24px;" />

      <h2 style="color: #0f172a;">Hello, ${name}!</h2>

      <p style="font-size: 16px; color: #334155; line-height: 1.5;">
        You've been invited by <strong>${ownerName}</strong> to join a trip to <strong>${destination}</strong> 🧳
      </p>

      <p style="font-size: 16px; color: #334155;">
        The trip will happen from <strong>${startDate}</strong> to <strong>${endDate}</strong>.
      </p>

      <a href="${confirmationLink}" style="
        display: inline-block;
        margin-top: 24px;
        background-color: #bef264;
        color: black;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: bold;">
        Confirm your participation
      </a>

      <p style="color: #334155; font-size: 13px; margin-top: 24px;">
        If you didn’t expect this invitation, just ignore it.
      </p>

      <p style="font-size: 13px; color: #334155;">
        Best regards, <br />
        Plann.er Team
      </p>
    </div>
  `.trim();

  try {
    await resend.emails.send({
      from: 'Plann.er <onboarding@resend.dev>',
      to: [email],
      subject: `Join ${ownerName}'s trip to ${destination}!`,
      html,
    });
  } catch (error) {
    console.error(`Failed to send guest invite email to ${email}`, error);
  }
}
