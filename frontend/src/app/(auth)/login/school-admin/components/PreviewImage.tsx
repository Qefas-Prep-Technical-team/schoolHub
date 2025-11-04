export default function PreviewImage() {
  return (
    <div className="w-full max-w-[280px] aspect-[4/3] rounded-lg bg-[#F6F9FC] dark:bg-background-dark p-4">
      <div
        className="h-full w-full rounded bg-center bg-no-repeat bg-cover"
        data-alt="Abstract dashboard illustration."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLhM2B-YEAg-fyl3s_xQz4PMhrg8TjoqVgZKQO7OpTDLTRl97qTtKCGtlfgofTg23athNCoUEW9qmpw5Zy656dUXV-z9deP1zPHzRt_w_gZXucxHQWYuUjdrSDXJEesI1dVADbyekbzLe7ItRNRpKKruPygN7QgUYjltg54xM9EWS8d0wRCspPc-FgO1_MhIBXDzv9Cz-ktgYyG2Kb3HZGaZKgB6JxsrRVg16bLs-YHJhVlsNlmygvmYH_b6hNamwEqSvN1raTPOg")',
        }}
      />
    </div>
  );
}
