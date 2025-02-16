export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center items-center flex flex-col">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gameButton-primary mb-4"></div>
                <p className="text-white text-lg">Crafting your magical story...</p>
            </div>
        </div>
    );
}
