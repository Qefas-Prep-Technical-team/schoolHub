import RoleCard from "./RoleCard";

export default function ImageGrid() {
  const roles = [
    {
      label: "Teacher 👩‍🏫",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBrInH0gXrDEswBX8gRAuurdyt9cXAJ-ZKAnnskl7IZF5F3H4Eu0l7VSMWLsXsmkfl3WWxaUsTLsRbmevFVLtrbyUsspX6NN61U8P6SwJ_thJi9BfRnUDtnNEfxxeRIxo1pKD3EArNfWc6SjWnA2QQq63J7v_prMBttVTbDQZ9TFYkMifNrBpIukzLTtLFISSHL7LBhUMJ6u1e_nm1fPu5NXDS5v7TEHkonnmkAwdI9x5aBDATMOAX-Va8vFwtPxamADAl1PNgezOI",
    },
    {
      label: "Student 👨‍🎓",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD0ShEaztUQ_0egX_yzkDO7_aK5BmuCdCM2TMZztGzi8rsJWehdU55Ky4R1DVFSXfK_mA767Nqp3pKQ6sxnbnU_jK58jHTtYj2BJEyG9BPadInWbul541UewZKvPdo-O5RWRpUEauCgqG1BMLTg0FmVFkZSvK5V4hmvRjKMAMrE4VOUNg9783g5DS3jCwclOioxZqdFVBLMEFGK3Ja6GPEirP234Leg_jaypH0BgfHXQeMasr2dCvzBEwO1oTRaZs8NKMbOiWUXzDc",
    },
    {
      label: "Parent 👪",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIA521TlKTm6Ts7bR55tXtbkvWZ-ufWyErtLmomsB0Xt81zhVASECliRM1vMoxOrx5E7qykHeuJUHdpax5PjIkp-j8r2nqNceYaBcpAdIecZ9h3T9PpyJia6gJtcwt_PWSLfdSptdZSQDwRZnUw4FCPYx9CLwxcFqbAXR13bSg6Pr3-nObu8q30PuIsinpzMJKyDzl05woP0pt4RSUcGX-OVChSUtf42eC1s94GbfHRLz21YEX2rMeiMWc0hdo8ZFpQ079BYDzRpU",
    },
    {
      label: "School Staff 🧑‍💼",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8dSQaZO6enhNKmnXD4CbiovXCZqhJV6Tnw0OglDvt5ysmK7cofEt5LkTTOsLLaLRJ4K2Cgy05WLKpDMuWM92cpIl5jaeIi1BeAGHNt3WT1VJtRrnOMx7YR2bWI4__RX0MHuwWQRi5x-oCiwp3VWUVmAaUKjH4ZC6I_aT1Iqkc6WeLwhm0wF3Wbf93YsXORq5WsSN7EoKUN67q8jiDGtiWKa6qaq5MgtdolNHFq5yKlWF6L0Mdq4ruyk1KM1KaOXglNwEPApylV7A",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {roles.map((role) => (
        <RoleCard key={role.label} {...role} />
      ))}
    </div>
  );
}
