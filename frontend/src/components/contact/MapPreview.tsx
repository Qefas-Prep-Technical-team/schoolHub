export default function MapPreview() {
    // ...existing code...
    return (
        <div className="w-full h-96 rounded-md overflow-hidden shadow-lg">
            <iframe
                src="https://maps.google.com/maps?q=19%20Oke%20St,%20Akowonjo,%20Lagos%20102213,%20Lagos,%20Nigeria&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                allowFullScreen
                loading="lazy"
                className="rounded-md"
            />
        </div>
    );
}
