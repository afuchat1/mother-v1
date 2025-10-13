import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const courses = [
  {
    title: 'Introduction to Community Marketing',
    description: 'Learn the basics of marketing within a community.',
    icon: BookOpen,
  },
  {
    title: 'Advanced Bartering Techniques',
    description: 'Master the art of negotiation and trade.',
    icon: BookOpen,
  },
  {
    title: 'Building Your Online Store',
    description: 'A step-by-step guide to selling online.',
    icon: BookOpen,
  },
  {
    title: 'Digital Skills for the Modern Age',
    description: 'Essential tech skills for today\'s world.',
    icon: BookOpen,
  },
];

export default function LearnPage() {
  return (
    <main className="flex-1 bg-secondary">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">AfuLearn</h1>
            <p className="text-muted-foreground">
              Learn new skills from your community.
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {course.title}
                </CardTitle>
                <course.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {course.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
