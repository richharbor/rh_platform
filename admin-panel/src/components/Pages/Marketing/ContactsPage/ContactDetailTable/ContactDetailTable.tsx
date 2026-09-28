import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactDetail } from "@/services/contact/contactService";

interface ContactDetailTableProps {
  contacts: ContactDetail[];
  contactsPage: number;
  pageSize: number;
}

export default function ContactDetailTable({
  contacts,
  contactsPage,
  pageSize,
}: ContactDetailTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact, idx) => (
          <TableRow key={contact.id}>
            <TableCell className="text-muted-foreground text-sm">
              {contactsPage * pageSize + idx + 1}
            </TableCell>
            <TableCell className="font-medium">{contact.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {contact.email ?? <span className="text-muted-foreground italic">—</span>}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {contact.phone ?? <span className="text-muted-foreground italic">—</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

