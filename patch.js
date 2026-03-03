const fs = require('fs');
const file = 'apps/school/src/components/dashboard/admin-dashboard/components/quick-actions-section.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { motion } from 'motion/react'",
  "import { Link } from '@tanstack/react-router'\nimport { motion } from 'motion/react'"
);

content = content.replace(
  "interface QuickActionButtonProps {",
  "interface QuickActionButtonProps {\n  to: string"
);

content = content.replace(
  "function QuickActionButton({ icon: Icon, label, color = 'bg-primary/10 text-primary' }: QuickActionButtonProps) {",
  "function QuickActionButton({ icon: Icon, label, color = 'bg-primary/10 text-primary', to }: QuickActionButtonProps) {"
);

content = content.replace(
  "<motion.button\n      type=\"button\"\n      whileHover={{ scale: 1.02 }}\n      whileTap={{ scale: 0.98 }}\n      className=\"\n        border-border/50 bg-card/80 flex items-center gap-4 rounded-xl border\n        p-4 text-sm font-medium shadow-sm transition-all\n        hover:shadow-md\n      \"\n    >",
  "<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>\n      <Link\n        to={to}\n        className=\"\n          border-border/50 bg-card/80 flex items-center gap-4 rounded-xl border\n          p-4 text-sm font-medium shadow-sm transition-all\n          hover:shadow-md\n        \"\n      >"
);

content = content.replace(
  "</motion.button>",
  "</Link>\n    </motion.div>"
);

content = content.replace(
  "<QuickActionButton icon={IconUsers} label={t.dashboard.addUser()} color=\"bg-secondary/10 text-secondary\" />",
  "<QuickActionButton icon={IconUsers} label={t.dashboard.addUser()} color=\"bg-secondary/10 text-secondary\" to=\"/settings/personnel/users/new\" />"
);

content = content.replace(
  "<QuickActionButton icon={IconSchool} label={t.dashboard.enrollStudent()} color=\"bg-success/10 text-success\" />",
  "<QuickActionButton icon={IconSchool} label={t.dashboard.enrollStudent()} color=\"bg-success/10 text-success\" to=\"/students/new\" />"
);

content = content.replace(
  "<QuickActionButton icon={IconBook} label={t.dashboard.createClass()} color=\"bg-accent/10 text-accent-foreground\" />",
  "<QuickActionButton icon={IconBook} label={t.dashboard.createClass()} color=\"bg-accent/10 text-accent-foreground\" to=\"/classes\" />"
);

content = content.replace(
  "<QuickActionButton icon={IconCurrencyDollar} label={t.dashboard.recordPayment()} color=\"bg-secondary/10 text-secondary\" />",
  "<QuickActionButton icon={IconCurrencyDollar} label={t.dashboard.recordPayment()} color=\"bg-secondary/10 text-secondary\" to=\"/accounting/payments\" />"
);

fs.writeFileSync(file, content);
