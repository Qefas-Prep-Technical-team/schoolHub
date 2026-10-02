export default function MapPreview() {
    // ...existing code...
    return (
        <div className="w-full h-full">
            <iframe
                src="https://maps.google.com/maps?q=19%20Oke%20St,%20Akowonjo,%20Lagos%20102213,%20Lagos,%20Nigeria&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                className="w-full h-full border-0"
            />
        </div>
    );
}
