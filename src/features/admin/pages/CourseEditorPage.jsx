import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseApi } from "@/services/supabase/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Trash,
  GripVertical,
  Save,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/utils/cn";

const CourseEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnail_url: "",
    level: "Beginner",
    published: false,
  });

  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const data = await courseApi.getCourseById(id);
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            thumbnail_url: data.thumbnail_url || "",
            level: data.level,
            published: data.published,
          });
          setModules(data.modules || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isEditing]);

  const handleBasicChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simplified save logic:
      // 1. Save Course Details
      let courseId = id;
      if (isEditing) {
        await courseApi.updateCourse(id, formData);
      } else {
        const newCourse = await courseApi.createCourse(formData);
        courseId = newCourse.id;
      }

      // 2. Save Modules & Lessons (Not fully implemented in this demo step due to complexity of syncing nested arrays)
      // In a real app, we'd loop through 'modules' state and upsert them linked to 'courseId'.

      navigate("/admin/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  // Module management helpers
  const addModule = () => {
    setModules([
      ...modules,
      {
        id: Date.now(),
        title: "New Module",
        sort_order: modules.length,
        lessons: [],
      },
    ]);
  };

  const updateModule = (index, field, value) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const deleteModule = (index) => {
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
  };

  // Lesson management helpers
  const addLesson = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      id: Date.now(),
      title: "New Lesson",
      type: "video",
      duration: "0m",
      sort_order: newModules[moduleIndex].lessons.length,
    });
    setModules(newModules);
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex][field] = value;
    setModules(newModules);
  };

  const deleteLesson = (moduleIndex, lessonIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.splice(lessonIndex, 1);
    setModules(newModules);
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/courses")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-muted-foreground">
            Setup your course details and curriculum.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/courses")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Basic Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Basic Info</h2>

            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleBasicChange}
                placeholder="e.g. Cartooning 101"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (BDT)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={handleBasicChange}
                placeholder="0 for free"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                value={formData.level}
                onChange={handleBasicChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleBasicChange}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={handleBasicChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish Course
              </Label>
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg">Curriculum</h2>
              <Button
                size="sm"
                onClick={addModule}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Module
              </Button>
            </div>

            <div className="space-y-6">
              {modules.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                  No modules yet. Click "Add Module" to start.
                </div>
              )}

              {modules.map((module, mIndex) => (
                <div
                  key={module.id}
                  className="border rounded-lg bg-gray-50/50 overflow-hidden"
                >
                  <div className="p-4 flex items-center gap-4 border-b bg-gray-100/50 group">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div className="flex-1 font-semibold flex items-center gap-2">
                      <span>Module {mIndex + 1}:</span>
                      <Input
                        value={module.title}
                        onChange={(e) =>
                          updateModule(mIndex, "title", e.target.value)
                        }
                        className="h-8 w-64 bg-transparent border-transparent hover:bg-white hover:border-input focus:bg-white focus:border-input transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteModule(mIndex)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {module.lessons.map((lesson, lIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-md border shadow-sm group"
                      >
                        <GripVertical className="h-4 w-4 text-gray-300 cursor-move" />
                        <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-6">
                            <Input
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(
                                  mIndex,
                                  lIndex,
                                  "title",
                                  e.target.value,
                                )
                              }
                              className="h-8"
                              placeholder="Lesson Title"
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              value={lesson.type}
                              onChange={(e) =>
                                updateLesson(
                                  mIndex,
                                  lIndex,
                                  "type",
                                  e.target.value,
                                )
                              }
                              className="h-8 w-full rounded border border-input bg-transparent px-2 text-xs"
                            >
                              <option value="video">Video</option>
                              <option value="quiz">Quiz</option>
                              <option value="assignment">Assignment</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <Input
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLesson(
                                  mIndex,
                                  lIndex,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              className="h-8"
                              placeholder="Duration"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteLesson(mIndex, lIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => addLesson(mIndex)}
                    >
                      <Plus className="h-3 w-3" /> Add Lesson
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditorPage;
