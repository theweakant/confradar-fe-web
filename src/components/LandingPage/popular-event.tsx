import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"

export default function PopularEvents() {
  const events = [
    {
      title: "Vietnam Tech Summit 2024",
      date: "15-16 Tháng 12, 2024",
      location: "TP. Hồ Chí Minh",
      type: "Tech",
      attendees: "500+",
      image: "/tech-conference-vietnam.jpg",
    },
    {
      title: "AI & Machine Learning Conference",
      date: "20-22 Tháng 1, 2025",
      location: "Hà Nội",
      type: "Tech",
      attendees: "300+",
      image: "/ai-machine-learning-conference.png",
    },
    {
      title: "International Research Symposium",
      date: "5-7 Tháng 2, 2025",
      location: "Đà Nẵng",
      type: "Research",
      attendees: "200+",
      image: "/academic-research-symposium.jpg",
    },
  ]

  return (
    <section id="events" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sự kiện nổi bật</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá các hội thảo và hội nghị được quan tâm nhất
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
                <Badge
                  className={`absolute top-4 right-4 ${
                    event.type === "Tech"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {event.type === "Tech" ? "💻 Tech" : "🎓 Research"}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {event.attendees} người tham gia
                </div>
                <Button className="w-full mt-4">Xem chi tiết</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Xem tất cả sự kiện
          </Button>
        </div>
      </div>
    </section>
  )
}
