"use client";

import { useState, useEffect, useRef } from "react";
import { Target, PartyPopper, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const gradingSystems = {
  switzerland: {
    name: "Switzerland",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
    description: "Higher is better (6 is best)",
  },
  germany: {
    name: "Germany",
    min: 1,
    max: 6,
    pass: 4,
    step: 0.1,
    description: "Lower is better (1 is best)",
  },
  usa: {
    name: "USA",
    min: 0,
    max: 100,
    pass: 60,
    step: 1,
    description: "Higher is better (100 is best)",
  },
};

export function GradeGoals() {
  const [system, setSystem] = useState("switzerland");
  const [currentGrade, setCurrentGrade] = useState("4.2");
  const [targetGrade, setTargetGrade] = useState("5.0");
  const [progress, setProgress] = useState(70);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  const selectedSystem = gradingSystems[system as keyof typeof gradingSystems];

  // New function to trigger celebration that can be called repeatedly
  const triggerCelebration = () => {
    // Reset the animation state briefly to allow re-triggering
    setShowCelebration(false);

    // Reset confetti first to clear old particles
    setConfetti([]);

    // Use a short timeout to ensure the DOM has updated
    setTimeout(() => {
      setShowCelebration(true);
      generateConfetti();
    }, 10);
  };

  useEffect(() => {
    // Just clean up confetti after animation, but don't hide celebration UI
    if (showCelebration) {
      const timer = setTimeout(() => {
        // Only clear confetti, keep the celebration UI visible
        setConfetti([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const generateConfetti = () => {
    const confettiCount = 150;
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
    ];

    const newConfetti = [];
    for (let i = 0; i < confettiCount; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 2,
        speed: Math.random() * 3 + 1,
        angle: Math.random() * 90 - 45,
      });
    }
    setConfetti(newConfetti);
  };

  const calculateProgress = () => {
    const current = Number.parseFloat(currentGrade);
    const target = Number.parseFloat(targetGrade);

    if (isNaN(current) || isNaN(target)) return;

    // Check if they've already reached their goal
    // For Germany, lower is better (goal reached if current <= target)
    // For others, higher is better (goal reached if current >= target)
    const goalReached =
      system === "germany" ? current <= target : current >= target;

    if (goalReached) {
      setProgress(100);
      triggerCelebration(); // Use the new function
      return;
    }

    const { min, max } = selectedSystem;

    // For Germany, we need to invert the calculation since 1 is best and 6 is worst
    if (system === "germany") {
      // Calculate how far they've gone from max (worst) toward target
      const range = target - max; // How far from worst to target
      const position = current - max; // How far from worst to current
      const newProgress = Math.min(100, Math.max(0, (position / range) * 100));
      setProgress(Math.round(newProgress));
      return;
    }

    // For Switzerland and USA (where higher is better)
    const range = target - min;
    const position = current - min;
    const newProgress = Math.min(100, Math.max(0, (position / range) * 100));
    setProgress(Math.round(newProgress));
  };

  const handleSystemChange = (newSystem: string) => {
    setSystem(newSystem);

    // Reset values based on selected system
    if (newSystem === "germany") {
      // For Germany, set target lower than current (since lower is better)
      setCurrentGrade("3.5");
      setTargetGrade("2.0"); // Target is better (lower) than current
    } else if (newSystem === "usa") {
      setCurrentGrade("70");
      setTargetGrade("85");
    } else {
      // Switzerland
      setCurrentGrade("4.2");
      setTargetGrade("5.0");
    }

    setProgress(70);
    setShowCelebration(false);
  };

  return (
    <Card className="p-6 border-0 shadow-sm relative overflow-hidden">
      {/* Confetti animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-fall"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.angle}deg)`,
                animation: `fall ${particle.speed}s linear forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full p-2 bg-green-500 text-white">
          <Target className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium">Grade Goals</h3>
      </div>

      <div className="mb-6">
        <Label htmlFor="grading-system" className="mb-2 block">
          Grading System
        </Label>
        <select
          id="grading-system"
          value={system}
          onChange={(e) => handleSystemChange(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="switzerland">Switzerland (1-6)</option>
          <option value="germany">Germany (1-6)</option>
          <option value="usa">USA (0-100)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedSystem.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="current-grade" className="mb-2 block">
            Current Grade
          </Label>
          <Input
            id="current-grade"
            type="number"
            min={selectedSystem.min}
            max={selectedSystem.max}
            step={selectedSystem.step}
            value={currentGrade}
            onChange={(e) => {
              setCurrentGrade(e.target.value);
              setShowCelebration(false);
            }}
            placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
          />
        </div>
        <div>
          <Label htmlFor="target-grade" className="mb-2 block">
            Target Grade
          </Label>
          <Input
            id="target-grade"
            type="number"
            min={selectedSystem.min}
            max={selectedSystem.max}
            step={selectedSystem.step}
            value={targetGrade}
            onChange={(e) => {
              setTargetGrade(e.target.value);
              setShowCelebration(false);
            }}
            placeholder={`Enter grade (${selectedSystem.min}-${selectedSystem.max})`}
          />
        </div>
      </div>

      <Button
        onClick={calculateProgress}
        className="w-full mb-6 bg-green-500 hover:bg-green-600 text-white"
      >
        Calculate Progress
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Current: {currentGrade}</span>
          <span>Target: {targetGrade}</span>
        </div>
        <Progress
          value={progress}
          className={`h-2 ${progress === 100 ? "bg-success" : ""}`}
        />

        {progress === 100 ? (
          <div className="text-center mt-2 animate-bounce">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <Check className="h-4 w-4" />
              <span className="font-medium">
                Goal achieved! Congratulations!
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            You're {progress}% of the way to your goal!
            {system === "germany"
              ? " (Lower grades are better in Germany)"
              : ""}
          </p>
        )}
      </div>

      {progress === 100 ? (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <PartyPopper className="h-4 w-4" />
            You've reached your target!
          </h4>
          <p className="text-sm text-muted-foreground">
            Great job achieving your grade goal! Consider setting a new, more
            challenging target to continue improving.
          </p>
          <Button
            onClick={triggerCelebration}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <PartyPopper className="h-4 w-4 mr-2" />
            Celebrate Again!
          </Button>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Tips to improve your grade:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Create a regular study schedule</li>
            <li>Form a study group with classmates</li>
            <li>Ask your teacher for additional resources</li>
            <li>Practice with past exams and quizzes</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
