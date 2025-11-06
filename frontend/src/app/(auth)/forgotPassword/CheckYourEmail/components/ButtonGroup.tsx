import Button from "./Button";

export default function ButtonGroup() {
  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      <Button text="Open Email App" variant="primary" />
      <Button text="Resend Link" variant="secondary" />
      <Button text="Back to Login" variant="ghost" />
    </div>
  );
}
