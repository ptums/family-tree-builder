const ProfileFact = ({ title, fact }: { title: string; fact: string }) => (
  <div className="my-2">
    <p className="font-bold">{title}</p>
    <span>{fact}</span>
  </div>
);

export default ProfileFact;
