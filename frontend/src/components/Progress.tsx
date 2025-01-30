import { useFlashcardStore } from '../store/flashcardStore';
import { ChartBarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Progress() {
    const flashcards = useFlashcardStore((state) => state.flashcards);

    // Calculate statistics
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter((card) => card.lastReviewed).length;
    const averageDifficulty =
        flashcards.reduce((sum, card) => sum + card.difficulty, 0) / totalCards || 0;

    const stats = [
        {
            name: 'Total Flashcards',
            value: totalCards,
            icon: ChartBarIcon,
            color: 'bg-blue-500',
        },
        {
            name: 'Cards Reviewed',
            value: reviewedCards,
            icon: CheckCircleIcon,
            color: 'bg-green-500',
        },
        {
            name: 'Average Difficulty',
            value: averageDifficulty.toFixed(1) + '/5',
            icon: ClockIcon,
            color: 'bg-yellow-500',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900">Your Progress</h2>
            <p className="mt-2 text-gray-600">Track your learning journey</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                                {stat.name}
                            </p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">
                                {stat.value}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            {totalCards === 0 ? (
                <div className="mt-8 text-center bg-white shadow rounded-lg p-6">
                    <p className="text-gray-500">
                        No flashcards created yet. Start by creating some flashcards!
                    </p>
                </div>
            ) : (
                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <div className="mt-4">
                        {flashcards
                            .filter((card) => card.lastReviewed)
                            .sort(
                                (a, b) =>
                                    new Date(b.lastReviewed!).getTime() -
                                    new Date(a.lastReviewed!).getTime()
                            )
                            .slice(0, 5)
                            .map((card) => (
                                <div
                                    key={card.id}
                                    className="border-t border-gray-200 py-3 flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {card.question}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Difficulty: {card.difficulty}/5
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-500">
                                            {new Date(card.lastReviewed!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
} 