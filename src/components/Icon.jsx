import {
  ArrowRight, ArrowUp, Award, Banknote, Circle, CircleCheck, FileBadge, Globe, HandHeart, Handshake,
  Heart, HeartHandshake, Landmark, LogIn, Mail, MapPin, Megaphone, Menu, Phone, Quote, Send,
  ShieldCheck, Smile, Sparkles, Stethoscope, Target, User, UserRound, Users, X,
} from 'lucide-react'

const icons = {
  ArrowRight, ArrowUp, Award, Banknote, CircleCheck, FileBadge, Globe, HandHeart, Handshake,
  Heart, HeartHandshake, Landmark, LogIn, Mail, MapPin, Megaphone, Menu, Phone, Quote, Send,
  ShieldCheck, Smile, Sparkles, Stethoscope, Target, User, UserRound, Users, X,
}

export const iconNames = Object.keys(icons)

export default function Icon({ name, size = 24, ...props }) {
  const Cmp = icons[name] || Circle
  return <Cmp size={size} strokeWidth={1.8} aria-hidden="true" {...props} />
}
