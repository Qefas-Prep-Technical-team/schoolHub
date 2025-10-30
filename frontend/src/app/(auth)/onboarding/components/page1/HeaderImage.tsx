interface HeaderImageProps {
  imageUrl: string;
  altText: string;
}

export default function HeaderImage({ imageUrl, altText }: HeaderImageProps) {
  return (
    <div className="@container">
      <div
        className="w-full bg-center bg-no-repeat bg-contain flex flex-col justify-end overflow-hidden min-h-60 sm:min-h-72"
        data-alt={altText}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
    </div>
  );
}
