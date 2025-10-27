export default function MapPreview() {
    // ...existing code...
    return (
        <div className="w-full h-96 rounded-md overflow-hidden shadow-lg">
            <iframe
                src="https://maps.google.com/maps?q=Quality Education For All Students&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                allowFullScreen
                loading="lazy"
                className="rounded-md"
            />
        </div>
    );
}