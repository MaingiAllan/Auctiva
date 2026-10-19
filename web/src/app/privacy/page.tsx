import InfoPage from "@/components/InfoPage";
export default function Privacy() {
  return (
    <InfoPage title="Privacy Policy" draft>
      <p>This explains what Auctiva collects and why, in line with Kenya&apos;s Data Protection Act, 2019.</p>
      <h2>What we collect</h2><ul><li>Your name and email address when you register.</li><li>Listing details you publish, such as model, price, location and IMEI.</li></ul>
      <h2>How we protect it</h2><p>Passwords are stored as one-way hashes, never in plain text. We do not sell your personal data.</p>
      <h2>Your rights</h2><p>You can ask to see, correct or delete your data. Contact details for requests will be published before launch.</p>
    </InfoPage>
  );
}
