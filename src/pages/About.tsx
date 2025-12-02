import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import aboutBg from "@/assets/about-bg.png";

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    { role: "Project Head", name: "Villanueva, Alexis" },
    { role: "Lead Developer", name: "Abejo, John Cyrus" },
    { role: "UI/UX Designer", name: "Cardona, Gerome John" },
    { role: "Marketing Manager", name: "Galaban, Kean Russel" },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: `url(${aboutBg})` }}
    >
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl text-center">About ISKXHand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            ISKXHand is an errand-based marketplace platform designed exclusively for UPLB students.
          </p>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Our Team</h3>
            <div className="grid gap-4">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between items-center p-4 rounded-lg bg-muted/50"
                >
                  <span className="font-semibold text-primary">{member.role}</span>
                  <span className="text-foreground">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
