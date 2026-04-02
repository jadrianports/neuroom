import { useState } from "react";
import { ArrowRight, ArrowUp, ArrowUpRight, Clock, Layers } from "lucide-react";
import type { Route } from "./+types/home";
import Navbar from "components/Navbar";
import Button from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { createProject } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const handleUploadComplete = async (base64image: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem = {
      id: newId, name, sourceImage: base64image, renderedImage: undefined,
      timestamp: Date.now(),
    }

    const saved = await createProject({ item: newItem, visibility: 'private' });

    if(!saved){
      console.error('Failed to create project');
      return false;
    }

    setProjects((prev) => [saved, ...prev]);

    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name } });
  }
  const [shellGlow, setShellGlow] = useState(false);
  
  return (
  <div className="home">
    <Navbar />
    <section className="hero">
      <div className="announce">
        <div className="dot">
          <div className="pulse"></div>
        </div>
        <p>Introducing Neuroom 1.0</p>
      </div>

      <h1>Build beautiful spaces at the speed of thought with Neuroom</h1>
      
      <p className="subtitle">
        Neuroom is an AI-powered design tool that helps you create stunning interiors in seconds. Whether you're a professional designer or just looking to spruce up your home, Neuroom has you covered.
      </p>

      <div className="actions">
        <a href="#upload" className="cta">
          Start Building <ArrowRight 
          className="icon" />
        </a>

        <Button variant="outline" size="lg" className="demo">
          Watch Demo
        </Button>
      </div>

      <div id="upload" className={`upload-shell ${shellGlow ? 'is-dragging-over' : ''}`}>
        <div className="grid-overlay"></div>

        <div className="upload-card">
          <div className="upload-head">
            <div className="upload-icon">
              <Layers className="icon"/>
            </div>
            <h3>Upload your floor plan</h3>
            <p>Supports JPG, PNG, and formats up to 10MB</p>
          </div>
          <Upload onDragging={setShellGlow} onComplete={handleUploadComplete} />
        </div>
      </div>
    </section>

    <section className="projects">
      <div className="section-inner">
        <div className="section-head">
          <div className="copy">
            <h2>Projects</h2>
            <p>Your latest work and shared community projects, all in one place</p>
          </div>
        </div>
        <div className="projects-grid">
          {projects.map(({ id, name, sourceImage, renderedImage, timestamp, sharedBy }) => (
            <div key={id} className="project-card group">
              <div className="preview">
                <img src={renderedImage || sourceImage} alt={name ?? 'Project'} />
                <div className="badge">
                  <span>{renderedImage ? 'Rendered' : 'Draft'}</span>
                </div>
              </div>

              <div className="card-body">
                <div>
                  <h3>{name}</h3>

                  <div className="meta">
                    <Clock size={12} />
                    <span>{new Date(timestamp).toLocaleDateString()}</span>
                    {sharedBy && <span>By {sharedBy}</span>}
                  </div>
                </div>
                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

  </div>
  )
}
