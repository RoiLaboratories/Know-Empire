import BackButton from "../../ui/BackButton";
import LeadersCard from "../../components/cards/LeadersCard";
import Tab from "../../components/layout/Tab";
import User from "../../assets/images/user.svg";
import User1 from "../../assets/images/user1.svg";
import User2 from "../../assets/images/user2.svg";
import User3 from "../../assets/images/user3.svg";
import User4 from "../../assets/images/user4.svg";
import User5 from "../../assets/images/user5.svg";
import User6 from "../../assets/images/user6.svg";

const leaders = [
  {
    name: "Pascal",
    username: "@official_fastest",
    rank: 1,
    num_package: 89,
    rating: "4.9",
    isTopSeller: true,
    avatar: User1,
  },
  {
    name: "Timothy",
    username: "@Loopymines",
    rank: 2,
    num_package: 89,
    rating: "4.9",
    isTopSeller: true,
    avatar: User2,
  },
  {
    name: "Kaspa",
    username: "@Id0care",
    rank: 3,
    num_package: 89,
    rating: "4.9",
    isTopSeller: true,
    avatar: User3,
  },
  {
    name: "Penny Grey",
    username: "@Sirpenny4real",
    rank: 4,
    num_package: 89,
    rating: "4.9",
    avatar: User4,
  },
  {
    name: "Lionel",
    username: "@Pableo",
    rank: 5,
    num_package: 89,
    rating: "4.9",
    avatar: User5,
  },
  {
    name: "Snow",
    username: "@official_snow",
    rank: 6,
    num_package: 89,
    rating: "4.9",
    avatar: User6,
  },
];

function LeaderBoard() {
  return (
    <section className="flex flex-col items-center  min-h-screen pb-3">
      <div className="w-9/10 max-w-lg flex flex-col gap-y-1">
        <div className="sticky top-0 space-y-3 bg-background py-3">
          <BackButton />
          <Tab name="Leaderboard" description="Check your ranking" />
        </div>

        {/*main content */}
        <div>
          <ul className="space-y-3">
            <LeadersCard
              name="Pascal"
              username="@official_fastest"
              rank={28}
              num_package={89}
              rating="3.9"
              avatar={User}
              isYou={true}
            />
            <p className="text-sm text-center">Top sellers</p>
            {leaders.map(
              (
                {
                  avatar,
                  name,
                  username,
                  rank,
                  rating,
                  isTopSeller,
                  num_package,
                },
                index
              ) => (
                <LeadersCard
                  key={index}
                  avatar={avatar}
                  name={name}
                  username={username}
                  rank={rank}
                  rating={rating}
                  isTopSeller={isTopSeller}
                  num_package={num_package}
                />
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default LeaderBoard;
