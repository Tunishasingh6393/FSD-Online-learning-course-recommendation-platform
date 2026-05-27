/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, CareerPath } from "../types";
import { api } from "../services/api";
import { User as UserIcon, BookOpen, Target, Briefcase, CheckCircle, Award } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState("");

  const availableInterests = [
    "Web Development",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity"
  ];

  const availableSkills = [
    "React", "Express", "Node.js", "MongoDB", "Tailwind CSS",
    "TensorFlow", "PyTorch", "Deep Learning", "Python", "LLMs", "RAG",
    "Cryptography", "Auth Sec", "OWASP Top 10", "Network Sec",
    "D3.js", "Pandas", "Data Visualization", "JavaScript", "HTML/CSS"
  ];

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, pathData] = await Promise.all([
        api.getProfile(),
        api.getCareerPaths()
      ]);
      setUser(profileData);
      setCareerPaths(pathData);

      // Populate form
      setName(profileData.name || "");
      setInterests(profileData.interests || []);
      setTargetSkills(profileData.targetSkills || []);
      setCurrentSkills(profileData.currentSkills || []);
      setSelectedPath(profileData.selectedCareerPath || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleTargetSkillToggle = (skill: string) => {
    if (targetSkills.includes(skill)) {
      setTargetSkills(targetSkills.filter(s => s !== skill));
    } else {
      setTargetSkills([...targetSkills, skill]);
    }
  };

  const handleCurrentSkillToggle = (skill: string) => {
    if (currentSkills.includes(skill)) {
      setCurrentSkills(currentSkills.filter(s => s !== skill));
    } else {
      setCurrentSkills([...currentSkills, skill]);
    }
  };

  const handleCareerPathSelect = (pathId: string) => {
    setSelectedPath(pathId);
    const pathObj = careerPaths.find(p => p.id === pathId);
    if (pathObj) {
      // Auto-populate target skills based on career goals! Excellent UX
      const uniqueSkills = Array.from(new Set([...targetSkills, ...pathObj.requiredSkills]));
      setTargetSkills(uniqueSkills);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.updateProfile({
        name,
        interests,
        targetSkills,
        currentSkills,
        selectedCareerPath: selectedPath
      });
      onProfileUpdated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
        id="profile-modal-container"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl" id="profile-icon">
              <UserIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 font-sans tracking-tight">Student Profile Settings</h2>
              <p className="text-sm text-neutral-500">Configure your learning profile & target career to recalibrate suggestions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 bg-white hover:bg-neutral-100 p-2 rounded-lg border border-neutral-200 transition-all text-xs font-semibold"
            id="close-profile-btn"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex-1 p-12 flex flex-col items-center justify-center gap-3" id="profile-loading">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-500">Retrieving profile meta records...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-neutral-800 transition-all font-sans"
                    placeholder="Enter your name"
                    required
                    id="profile-name-input"
                  />
                </div>
              </div>

              {/* Step 1: Select Career Path */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <Briefcase size={16} className="text-neutral-500" />
                  <span>Target Career Milestone</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="career-path-options">
                  {careerPaths.map((path) => {
                    const isSelected = selectedPath === path.id;
                    return (
                      <div
                        key={path.id}
                        onClick={() => handleCareerPathSelect(path.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40"
                        }`}
                        id={`career-option-${path.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-neutral-950 text-sm">{path.title}</h4>
                          {isSelected && <Award size={16} className="text-indigo-600" />}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{path.desc}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {path.requiredSkills.map((sk) => (
                            <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-sans">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Target Topics & Interests */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <BookOpen size={16} className="text-neutral-500" />
                  <span>Topic Category Interests</span>
                </div>
                <div className="flex flex-wrap gap-2" id="interest-pills">
                  {availableInterests.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                        id={`interest-pill-${interest.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Target Skills vs Familiar Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Skills */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Target size={16} className="text-neutral-500" />
                    <span>Skills to Master</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 border border-neutral-100 rounded-xl bg-neutral-50/50" id="target-skills-scroll">
                    {availableSkills.map((skill) => {
                      const isSelected = targetSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => handleTargetSkillToggle(skill)}
                          className={`px-2.5 py-1 rounded text-xs transition-all border ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                          }`}
                          id={`target-skill-${skill.replace(/[\s+#/]+/g, '-').toLowerCase()}`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Skills (Already know) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <CheckCircle size={16} className="text-neutral-500" />
                    <span>Skills Already Mastered</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 border border-neutral-100 rounded-xl bg-neutral-50/50" id="current-skills-scroll">
                    {availableSkills.map((skill) => {
                      const isSelected = currentSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => handleCurrentSkillToggle(skill)}
                          className={`px-2.5 py-1 rounded text-xs transition-all border ${
                            isSelected
                              ? "bg-teal-50 border-teal-200 text-teal-700 font-medium"
                              : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                          }`}
                          id={`current-skill-${skill.replace(/[\s+#/]+/g, '-').toLowerCase()}`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-all bg-white"
                id="cancel-profile-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                id="save-profile-btn"
              >
                {submitting ? "Recalibrating..." : "Save & Recalibrate"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
